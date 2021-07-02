package contracts

// MessageType for socket communication
type MessageType string

// Available message types
const (
	RegisterMessageType MessageType = "register"
	DataMessageType     MessageType = "data"
	MetadataMessageType MessageType = "metadata"
	ClickMessageType    MessageType = "click"
	ResetMessageType    MessageType = "reset"
)
