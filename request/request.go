package request

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"school-equipment-lending-system/database"
)

type Request struct {
	RequestId   int    `json:"requestId"`
	UserId      int    `json:"userId"`
	Name        string `json:"Username"`
	EquipmentId int    `json:"equipmentId"`
	Quantity    int    `json:"quantity"`
	CreatedAt   string `json:"createdAt"`
	BorrowDate  string `json:"borrowDate"`
	Remarks     string `json:"remarks"`
}

// GET all requests
func GetAllRequests(c *gin.Context) {
	var request []Request
	if err := database.GetDB().Find(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, request)
}

// GET request by ID
func GetRequestByID(c *gin.Context) {
	id := c.Param("id")
	var request Request
	if err := database.GetDB().First(&request, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "request not found"})
		return
	}
	c.JSON(http.StatusOK, request)
}

// POST new request
func CreateRequest(c *gin.Context) {
	var request Request
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.GetDB().Create(&request).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, request)
}

// PUT update request
func UpdateRequest(c *gin.Context) {
	id := c.Param("id")
	var request Request

	db := database.GetDB()
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
	db := database.GetDB()
	if err := db.Delete(&Request{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Request deleted"})
}

func RegisterRequestRoutes(r *gin.Engine) {
	requestRoutes := r.Group("/requests")
	{
		requestRoutes.GET("/", GetAllRequests)
		requestRoutes.GET("/:id", GetRequestByID)
		requestRoutes.POST("/", CreateRequest)
		requestRoutes.PUT("/:id", UpdateRequest)
		requestRoutes.DELETE("/:id", DeleteRequest)
	}
}
