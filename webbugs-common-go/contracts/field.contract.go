package contracts

// FieldContract - contract for models.Field
type FieldContract struct {
	Radius uint                    `json:"radius"`
	Grid   map[int64]*CellContract `json:"grid"`
}

// MultiFieldContract - contract for models.Field
type MultiFieldContract struct {
	PageRadius  uint                    `json:"pageRadius"`
	Grid        map[int64]FieldContract `json:"grid"`
	Coordinates []CoordinatesContract   `json:"coordinates"`
}
