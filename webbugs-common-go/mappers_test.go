package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"testing"
	"webbugs-common/contracts"
	"webbugs-common/mappers"
	"webbugs-common/models"

	"github.com/google/uuid"
)

func TestMapToData(t *testing.T) {
	jsonStr, err := ioutil.ReadFile("./resources/data0.test.resources.json")
	if err != nil {
		t.Log("error should be nil", err)
		t.Fail()
	}

	var contract contracts.DataContract
	err = json.Unmarshal(jsonStr, &contract)
	if err != nil {
		t.Log("error (2) should be nil", err)
		t.Fail()
	}

	field, components, err := mappers.MapToData(&contract)
	if err != nil {
		t.Log("error (3) should be nil", err)
		t.Fail()
	}

	log.Println(field, components)

	cell := field.Get(models.NewCoordinates(3, -8, 5))
	if cell == nil {
		t.Log("Cell [3,-8,5] is expected to be present")
		t.Fail()
	}

	if cell.CellType != models.CellTypeWall {
		t.Log("Cell [3,-8,5] has unexpected cell type", cell.CellType)
		t.Fail()
	}

	expectedUUID, err := uuid.Parse("a1322c04-1029-4bb4-92d0-34d865c90e46")
	if cell.PlayerID != expectedUUID {
		t.Log("Cell [3,-8,5] has unexpected player id", cell.PlayerID)
		t.Fail()
	}

	if cell.Crd != models.NewCoordinates(3, -8, 5) {
		t.Log("Cell [3,-8,5] has unexpected coordinates", cell.Crd)
		t.Fail()
	}

	if cell.Component == nil {
		t.Log("Cell [3,-8,5] is expected to have a component")
		t.FailNow()
	}
	componentID := cell.Component.ID

	component, succ := components.Get(componentID)
	if !succ {
		t.Log(fmt.Sprintf("Component [%d] is expected to be present", componentID))
		t.Fail()
	}

	if component.ID != componentID {
		t.Log(fmt.Sprintf("Component [%d] is expected to have an id 1", componentID))
		t.Fail()
	}

	if component.IsActive {
		t.Log(fmt.Sprintf("Component [%d] is expected to be inactive", componentID))
		t.Fail()
	}

	if len(component.Walls) != 13 {
		t.Log(fmt.Sprintf("Component [%d] is expected to have 13 walls", componentID))
		t.Fail()
	}

	component2, succ := components.Get(componentID + 1)
	if !succ {
		t.Log(fmt.Sprintf("Component [%d] is expected to be present", componentID+1))
		t.Fail()
	}

	if !component2.IsActive {
		t.Log(fmt.Sprintf("Component [%d] is expected to be active", componentID+1))
		t.Fail()
	}
}
