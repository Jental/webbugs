package contracts

// DataContract - contract for field data
type DataContract struct {
	Field      MultiFieldContract         `json:"field"`
	Components map[uint]ComponentContract `json:"components"`
}
