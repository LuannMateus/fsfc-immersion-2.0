package main

import (
	"fmt"
	"log"

	kafka "github.com/LuannMateus/fsfc-immersion-2.0-simulator/infra/kafka"
	kafka2 "github.com/LuannMateus/fsfc-immersion-2.0-simulator/src/kafka"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/joho/godotenv"
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func main() {
	msgChan := make(chan *ckafka.Message)
	consumer := kafka.NewKafkaConsumer(msgChan)
	go consumer.Consume()

	for msg := range msgChan {
		fmt.Println(string(msg.Value))
		go kafka2.Produce(msg)

	}

}
