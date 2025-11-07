package request

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type Request struct {
	requestId   int    `json:"requestId"`
	userId      int    `json:"userId"`
	name        string `json:"Username"`
	equipmentId int    `json:"equipmentId"`
	quantity    int    `json:"quantity"`
	createdAt   string `json:"createdAt"`
	borrowDate  string `json:"borrowDate"`
	remarks     string `json:"remarks"`
}

var Requests []Request

func RegisterRequestRoutes(r *gin.Engine) {
	requestRoutes := r.Group("/requests")
	{
		// GET all requests
		requestRoutes.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, Requests)
		})

		// add new equipment
		requestRoutes.POST("/", func(c *gin.Context) {
			var newRequest Request
			if err := c.BindJSON(&newRequest); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			Requests = append(Requests, newRequest)
			c.JSON(http.StatusCreated, newRequest)
		})
	}
}
