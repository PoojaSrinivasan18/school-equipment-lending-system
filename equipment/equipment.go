package equipment

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

var db *gorm.DB

func SetDB(database *gorm.DB) {
	db = database
}

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

// GET all equipments
func GetAllEquipments(c *gin.Context) {
	var equipments []Equipment
	if err := db.Find(&equipments).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, equipments)
}

// GET equipment by ID
func GetEquipmentByID(c *gin.Context) {
	id := c.Param("id")
	var equipment Equipment
	if err := db.First(&equipment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		return
	}
	c.JSON(http.StatusOK, equipment)
}

// POST new equipment
func CreateEquipment(c *gin.Context) {
	var newEquipment Equipment
	if err := c.BindJSON(&newEquipment); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Create(&newEquipment).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, newEquipment)
}

// PUT update equipment
func UpdateEquipment(c *gin.Context) {
	id := c.Param("id")
	var equipment Equipment

	if err := db.First(&equipment, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		return
	}

	var updated Equipment
	if err := c.BindJSON(&updated); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&equipment).Updates(updated)
	c.JSON(http.StatusOK, equipment)
}

// DELETE equipment
func DeleteEquipment(c *gin.Context) {
	id := c.Param("id")
	if err := db.Delete(&Equipment{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Equipment deleted"})
}

// Register routes
func RegisterEquipmentRoutes(r *gin.Engine) {
	equipmentRoutes := r.Group("/equipments")
	{
		equipmentRoutes.GET("/", GetAllEquipments)
		equipmentRoutes.GET("/:id", GetEquipmentByID)
		equipmentRoutes.POST("/", CreateEquipment)
		equipmentRoutes.PUT("/:id", UpdateEquipment)
		equipmentRoutes.DELETE("/:id", DeleteEquipment)
	}
}
