package user

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Password  string `json:"password"`
	createdAt string `json:"createdAt"`
	updatedAt string `json:"updatedAt"`
}

var Users []User

func RegisterUserRoutes(r *gin.Engine) {
	userRoutes := r.Group("/users")
	{
		userRoutes.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, Users)
		})

		userRoutes.POST("/", func(c *gin.Context) {
			var newUser User
			if err := c.BindJSON(&newUser); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			Users = append(Users, newUser)
			c.JSON(http.StatusCreated, newUser)
		})
	}
}
