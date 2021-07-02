package contracts

// CoordinatesContract - contract for models.Coordinates
type CoordinatesContract struct {
	X int64 `json:"x"`
	Y int64 `json:"y"`
	Z int64 `json:"z"`
}

// FullCoordinatesContract - contract for models.FullCoordinates
type FullCoordinatesContract struct {
	Page CoordinatesContract `json:"page"`
	Cell CoordinatesContract `json:"cell"`
}
