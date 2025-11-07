package equipment

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Equipment struct {
	id             int    `json:"id"`
	name           string `json:"name"`
	availableStock int    `json:"availableStock"`
	totalStock     int    `json:"totalStock"`
	category       string `json:"category"`
	createdAt      string `json:"createdAt"`
	updatedAt      string `json:"updatedAt"`
	description    string `json:"description"`
}

var Equipments []Equipment

func RegisterEquipmentRoutes(r *gin.Engine) {
	equipmentRoutes := r.Group("/equipments")
	{
		// GET all equipments
		equipmentRoutes.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, Equipments)
		})

		// add new equipment
		equipmentRoutes.POST("/", func(c *gin.Context) {
			var newEquipment Equipment
			if err := c.BindJSON(&newEquipment); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			Equipments = append(Equipments, newEquipment)
			c.JSON(http.StatusCreated, newEquipment)
		})
	}
}
