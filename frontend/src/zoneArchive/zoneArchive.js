import React, { useState, useEffect } from 'react';
import './zoneArchive.scss';	

function ZoneArchive () {
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [exampleZone, setExampleZone] = useState({
    id: 1,
    name: 'Example Zone',
    products: []
  });

  function addZone() {
    
    setZones([...zones, exampleZone]);
    setSelectedZone(exampleZone.id);
  }

  function goToZone(zoneId) {
    console.log(zoneId);
  }

  function updateZone(e) {
    e.preventDefault();
    console.log(exampleZone);
  }


  function editZone(zoneId) {
    setSelectedZone(zoneId);
  }

  useEffect(() => {
    console.log(window);
  }, [window]);

  return (
    <section>
      <h2>Zone Archive</h2>
      <button className="vzi-button add-zone"
              onClick={addZone}>
        Add Zone
      </button>
      <ul className="vzi-zone-archive__list">
        {
          zones.map(zone => (
            <li key={zone.id}>
              <article className="vzi-zone__card">
                <button className="vzi-zone-archive__zone"
                        onClick={() => goToZone(zone.id)}>
                  {zone.name} 
                </button>
                <button className="vzi-zone-archive__edit"
                        onClick={(e) => editZone(zone.id)}>
                  Edit
                </button>
              </article>
            </li>
          ))
        }
      </ul>
      {
        selectedZone && (
          <section>
              <form onSubmit={(e) => updateZone(e)} 
                  className="vzi-zone-archive__edit-zone">
              <label>
                <p>
                  Name
                </p>
                <input type="text" 
                      value={exampleZone.name}
                      onChange={(e) => setExampleZone({...exampleZone, name: e.target.value})} />
              </label>
              <button type="submit"
                      className="vzi-button vzi-zone-archive__save">
                Save
              </button>
            </form>
          </section>
        )
      }
    
    </section>
  );
}

export default ZoneArchive;