package equipment

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

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

var Equipments []Equipment

func RegisterEquipmentRoutes(r *gin.Engine) {
	equipmentRoutes := r.Group("/equipments")
	{
		// GET all equipments
		equipmentRoutes.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, Equipments)
		})

		// GET equipment by ID
		equipmentRoutes.GET("/:id", func(c *gin.Context) {
			id := c.Param("id")
			for _, eq := range Equipments {
				if fmt.Sprint(eq.ID) == id {
					c.JSON(http.StatusOK, eq)
					return
				}
			}
			c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		})

		// POST new equipment
		equipmentRoutes.POST("/", func(c *gin.Context) {
			var newEquipment Equipment
			if err := c.BindJSON(&newEquipment); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			Equipments = append(Equipments, newEquipment)
			c.JSON(http.StatusCreated, newEquipment)
		})

		// PUT update equipment
		equipmentRoutes.PUT("/:id", func(c *gin.Context) {
			id := c.Param("id")
			var updated Equipment
			if err := c.BindJSON(&updated); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			for i, eq := range Equipments {
				if fmt.Sprint(eq.ID) == id {
					Equipments[i] = updated
					c.JSON(http.StatusOK, updated)
					return
				}
			}
			c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		})

		// DELETE equipment
		equipmentRoutes.DELETE("/:id", func(c *gin.Context) {
			id := c.Param("id")
			for i, eq := range Equipments {
				if fmt.Sprint(eq.ID) == id {
					Equipments = append(Equipments[:i], Equipments[i+1:]...)
					c.JSON(http.StatusOK, gin.H{"message": "Equipment deleted"})
					return
				}
			}
			c.JSON(http.StatusNotFound, gin.H{"message": "Equipment not found"})
		})
	}
}
