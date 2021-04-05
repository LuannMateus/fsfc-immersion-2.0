package kafka

import (
	"encoding/json"
	"log"
	"time"

	"github.com/LuannMateus/fsfc-immersion-2.0-simulator/infra/kafka"
	route2 "github.com/LuannMateus/fsfc-immersion-2.0-simulator/src/route"
	ckafka "github.com/confluentinc/confluent-kafka-go/kafka"
)

// Produce is responsible to publish the positions of each request
// Example of a json request:
//{"clientId":"1","routeId":"1"}
//{"clientId":"2","routeId":"2"}
//{"clientId":"3","routeId":"3"}
func Produce(msg *ckafka.Message) {

	producer := kafka.NewKafkaProducer()
	route := route2.NewRoute()
	json.Unmarshal(msg.Value, &route)

	route.LoadPositions()
	positions, err := route.ExportJsonPositions()

	if err != nil {
		log.Println(err.Error())
	}

	for _, p := range positions {
		kafka.Publish(p, "route.new-position", producer)
		time.Sleep(time.Millisecond * 500)
	}

}
