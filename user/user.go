package user

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"school-equipment-lending-system/database"
)

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

// GET all users
func GetAllUsers(c *gin.Context) {
	var user []User
	if err := database.GetDB().Find(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, user)
}

// GET user by ID
func GetUserByID(c *gin.Context) {
	id := c.Param("id")
	var user User
	if err := database.GetDB().First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

// POST new user
func CreateUser(c *gin.Context) {
	var user User
	if err := c.BindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.GetDB().Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, user)
}

// PUT update request
func UpdateUser(c *gin.Context) {
	id := c.Param("id")
	var user User

	db := database.GetDB()
	if err := db.First(&user, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		return
	}

	var updated User
	if err := c.BindJSON(&updated); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Model(&user).Updates(updated)
	c.JSON(http.StatusOK, user)
}

// DELETE request
func DeleteUser(c *gin.Context) {
	id := c.Param("id")
	db := database.GetDB()
	if err := db.Delete(&User{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
}

func RegisterUserRoutes(r *gin.Engine) {
	userRoutes := r.Group("/users")
	{
		userRoutes.GET("/", GetAllUsers)
		userRoutes.GET("/id", GetAllUsers)
		userRoutes.POST("/", CreateUser)
		userRoutes.PUT("/id", UpdateUser)
		userRoutes.DELETE("/id", DeleteUser)

	}
}
