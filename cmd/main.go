package main

import (
	"github.com/gin-gonic/gin"
	"school-equipment-lending-system/equipment"
	"school-equipment-lending-system/request"
	"school-equipment-lending-system/user"
)

func main() {
	router := gin.Default()
	user.RegisterUserRoutes(router)
	equipment.RegisterEquipmentRoutes(router)
	request.RegisterRequestRoutes(router)

	router.Run("localhost:8080")

}
