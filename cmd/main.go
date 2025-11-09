package main

import (
	"net/http"
	"school-equipment-lending-system/database"
	"school-equipment-lending-system/equipment"
	"school-equipment-lending-system/request"
	"school-equipment-lending-system/user"

	"github.com/gin-gonic/gin"
)

// CORS middleware
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func main() {
	// Initialize database connection
	database.SetupDB()
	db := database.GetDB()

	// Set database instance in packages
	user.SetDB(db)
	equipment.SetDB(db)
	request.SetDB(db)

	router := gin.Default()

	// Add CORS middleware
	router.Use(CORSMiddleware())

	// Register routes
	user.RegisterUserRoutes(router)
	equipment.RegisterEquipmentRoutes(router)
	request.RegisterRequestRoutes(router)

	router.Run("localhost:8080")
}
