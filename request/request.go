package request

import (
	"fmt"
	"github.com/gin-gonic/gin"
	"net/http"
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

var Requests []Request

func RegisterRequestRoutes(r *gin.Engine) {
	requestRoutes := r.Group("/requests")
	{
		// GET all requests
		requestRoutes.GET("/", func(c *gin.Context) {
			c.JSON(http.StatusOK, Requests)
		})

		// GET request by ID
		requestRoutes.GET("/:id", func(c *gin.Context) {
			id := c.Param("id")
			for _, req := range Requests {
				if fmt.Sprint(req.RequestId) == id {
					c.JSON(http.StatusOK, req)
					return
				}
			}
			c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		})

		// POST create new request
		requestRoutes.POST("/", func(c *gin.Context) {
			var newRequest Request
			if err := c.BindJSON(&newRequest); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			Requests = append(Requests, newRequest)
			c.JSON(http.StatusCreated, newRequest)
		})

		// PUT update request
		requestRoutes.PUT("/:id", func(c *gin.Context) {
			id := c.Param("id")
			var updated Request
			if err := c.BindJSON(&updated); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			for i, req := range Requests {
				if fmt.Sprint(req.RequestId) == id {
					Requests[i] = updated
					c.JSON(http.StatusOK, updated)
					return
				}
			}
			c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		})

		// DELETE request
		requestRoutes.DELETE("/:id", func(c *gin.Context) {
			id := c.Param("id")
			for i, req := range Requests {
				if fmt.Sprint(req.RequestId) == id {
					Requests = append(Requests[:i], Requests[i+1:]...)
					c.JSON(http.StatusOK, gin.H{"message": "Request deleted"})
					return
				}
			}
			c.JSON(http.StatusNotFound, gin.H{"message": "Request not found"})
		})
	}
}
