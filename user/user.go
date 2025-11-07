package user

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
)

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}

var Users []User

func RegisterUserRoutes(r *gin.Engine) {
	userRoutes := r.Group("/users")
	{
		// Get all users
		userRoutes.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, Users)
		})

		// Get user by ID
		userRoutes.GET("/:id", func(c *gin.Context) {
			idParam := c.Param("id")

			for _, user := range Users {
				if fmt.Sprint(user.ID) == idParam {
					c.JSON(http.StatusOK, user)
					return
				}
			}

			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		})

		// Create user
		userRoutes.POST("/", func(c *gin.Context) {
			var newUser User
			if err := c.BindJSON(&newUser); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			Users = append(Users, newUser)
			c.JSON(http.StatusCreated, newUser)
		})

		// Update user
		userRoutes.PUT("/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			var updatedUser User

			if err := c.BindJSON(&updatedUser); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			for i, user := range Users {
				if fmt.Sprint(user.ID) == idParam {
					Users[i] = updatedUser
					c.JSON(http.StatusOK, updatedUser)
					return
				}
			}

			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		})

		// Delete user
		userRoutes.DELETE("/:id", func(c *gin.Context) {
			idParam := c.Param("id")

			for i, user := range Users {
				if fmt.Sprint(user.ID) == idParam {
					Users = append(Users[:i], Users[i+1:]...)
					c.JSON(http.StatusOK, gin.H{"message": "User deleted"})
					return
				}
			}

			c.JSON(http.StatusNotFound, gin.H{"message": "User not found"})
		})
	}
}
