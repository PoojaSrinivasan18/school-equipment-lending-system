package request

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB

func SetDB(database *gorm.DB) {
	db = database
}

type Request struct {
	RequestId   int    `json:"requestId" gorm:"primaryKey;autoIncrement"`
	UserId      int    `json:"userId"`
	Name        string `json:"Username"`
	EquipmentId int    `json:"equipmentId"`
	Quantity    int    `json:"quantity"`
	Status      string `json:"status"` // pending, approved, rejected, completed
	CreatedAt   string `json:"createdAt"`
	BorrowDate  string `json:"borrowDate"`
	Remarks     string `json:"remarks"`
}

// GET all requests
func GetAllRequests(c *gin.Context) {
	var request []Request
	if err := db.Find(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, request)
}

// GET request by ID
func GetRequestByID(c *gin.Context) {
	id := c.Param("id")
	var request Request
	if err := db.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "request not found"})
		return
	}
	c.JSON(http.StatusOK, request)
}

// GET requests by User ID
func GetRequestsByUserID(c *gin.Context) {
	userId := c.Param("userId")
	var requests []Request
	if err := db.Where("user_id = ?", userId).Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, requests)
}

// GET requests by Status
func GetRequestsByStatus(c *gin.Context) {
	status := c.Param("status")
	var requests []Request
	if err := db.Where("status = ?", status).Find(&requests).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, requests)
}

// POST new request
func CreateRequest(c *gin.Context) {
	var request Request
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, request)
}

// PUT update request
func UpdateRequest(c *gin.Context) {
	id := c.Param("id")
	var request Request

	if err := db.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		return
	}

	var updated Request
	if err := c.BindJSON(&updated); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&request).Updates(updated)
	c.JSON(http.StatusOK, request)
}

// DELETE request
func DeleteRequest(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&Request{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Request deleted"})
}

// Equipment struct for inventory management
type Equipment struct {
	ID             int    `json:"id" gorm:"primaryKey;autoIncrement"`
	Name           string `json:"name"`
	AvailableStock int    `json:"availableStock"`
	TotalStock     int    `json:"totalStock"`
	Category       string `json:"category"`
	CreatedAt      string `json:"createdAt"`
	UpdatedAt      string `json:"updatedAt"`
	Description    string `json:"description"`
}

// POST approve request - updates inventory
func ApproveRequest(c *gin.Context) {
	id := c.Param("id")
	var request Request

	// Find the request
	if err := db.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		return
	}

	// Check if request is in pending status
	if request.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Request is not in pending status"})
		return
	}

	// Find the equipment
	var equipment Equipment
	if err := db.First(&equipment, request.EquipmentId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		return
	}

	// Check if enough stock is available
	if equipment.AvailableStock < request.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{
			"message":   "Insufficient stock available",
			"available": equipment.AvailableStock,
			"requested": request.Quantity,
		})
		return
	}

	// Start database transaction
	tx := db.Begin()

	// Update equipment stock (reduce available stock)
	if err := tx.Model(&equipment).Update("available_stock", equipment.AvailableStock-request.Quantity).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update equipment stock"})
		return
	}

	// Update request status to approved
	if err := tx.Model(&request).Update("status", "approved").Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
		return
	}

	// Commit transaction
	tx.Commit()

	// Return updated request
	db.First(&request, id) // Reload to get updated data
	c.JSON(http.StatusOK, gin.H{
		"message": "Request approved successfully",
		"request": request,
		"equipmentStockUpdated": gin.H{
			"equipmentId":       equipment.ID,
			"newAvailableStock": equipment.AvailableStock - request.Quantity,
		},
	})
}

// POST reject request - no inventory change
func RejectRequest(c *gin.Context) {
	id := c.Param("id")
	var request Request

	// Find the request
	if err := db.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		return
	}

	// Check if request is in pending status
	if request.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Request is not in pending status"})
		return
	}

	// Update request status to rejected
	if err := db.Model(&request).Update("status", "rejected").Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
		return
	}

	// Return updated request
	db.First(&request, id) // Reload to get updated data
	c.JSON(http.StatusOK, gin.H{
		"message": "Request rejected successfully",
		"request": request,
	})
}

// POST return equipment - releases equipment back to inventory
func ReturnEquipment(c *gin.Context) {
	id := c.Param("id")
	var request Request

	// Find the request
	if err := db.First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		return
	}

	// Check if request is in approved status (equipment was borrowed)
	if request.Status != "approved" {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Request is not in approved status. Cannot return equipment."})
		return
	}

	// Find the equipment
	var equipment Equipment
	if err := db.First(&equipment, request.EquipmentId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		return
	}

	// Start database transaction
	tx := db.Begin()

	// Update equipment stock (add back to available stock)
	newAvailableStock := equipment.AvailableStock + request.Quantity
	if err := tx.Model(&equipment).Update("available_stock", newAvailableStock).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update equipment stock"})
		return
	}

	// Update request status to completed
	if err := tx.Model(&request).Update("status", "completed").Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update request status"})
		return
	}

	// Commit transaction
	tx.Commit()

	// Return updated request
	db.First(&request, id) // Reload to get updated data
	c.JSON(http.StatusOK, gin.H{
		"message": "Equipment returned successfully",
		"request": request,
		"equipmentStockUpdated": gin.H{
			"equipmentId":       equipment.ID,
			"newAvailableStock": newAvailableStock,
		},
	})
}

func RegisterRequestRoutes(r *gin.Engine) {
	requestRoutes := r.Group("/requests")
	{
		requestRoutes.GET("/", GetAllRequests)
		requestRoutes.GET("/:id", GetRequestByID)
		requestRoutes.GET("/user/:userId", GetRequestsByUserID)
		requestRoutes.GET("/status/:status", GetRequestsByStatus)
		requestRoutes.POST("/", CreateRequest)
		requestRoutes.PUT("/:id", UpdateRequest)
		requestRoutes.DELETE("/:id", DeleteRequest)

		// New endpoints for approval workflow
		requestRoutes.POST("/:id/approve", ApproveRequest)
		requestRoutes.POST("/:id/reject", RejectRequest)
		requestRoutes.POST("/:id/return", ReturnEquipment)
	}
}
