package database

import (
	"fmt"
	"log"
	"school-equipment-lending-system/equipment"
	"school-equipment-lending-system/request"
	"school-equipment-lending-system/user"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func SetupDB() {
	dsn := "host=localhost user=postgres password=postgres dbname=school_lending port=5432 sslmode=disable"

	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	fmt.Println("Connected to PostgreSQL successfully!")

	// Auto-migrate tables
	DB.AutoMigrate(
		&user.User{},
		&equipment.Equipment{},
		&request.Request{},
	)
}

func GetDB() *gorm.DB {
	return DB
}
