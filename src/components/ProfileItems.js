import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';


export default function ProfileItems({userObj}) {
    const [event, setEvent] = useState("")
    const [pb, setPb] = useState(0)
    const [pbWeight, setPbWeight] = useState("")
    const [date, setDate] = useState("")
    const [setting, setSetting] = useState("")
    const [unit, setUnit] =useState("")
    const [step, setStep] = useState(1)
    const [user, setUser] = useState({})
    const [addingItemId, setAddingItemId] = useState(null)
    const [expandedItemId, setExpandedItemId] = useState(null);
    const [animation, setAnimation] = useState("slideInFromRight")
    const [personalBests, setPersonalBests] = useState([])

    const [profileItems, setProfileItems] = useState([
        { id: 1, title: "Dina PB", details: [{ event: "100m", performance: "10.23", date: "2024-01-02", unit:"s", outside: true }, { event: "Längdhopp", performance: "7.35", date: "2024-01-02", unit:"m", outside: true }, { event: "Kast med liten boll", performance: "55", date: "2024-01-02", unit:"m", outside: true }] },
        { id: 2, title: "Dina SB", details: [{ event: "200m", performance: "20.56", date: "2024-01-02", unit:"s", outside: true }, { event: "Höjdhopp", performance: "2.05", date: "2024-01-02", unit:"m", outside: true }] },
        { id: 3, title: "Tävlingar", details: "Competition Details" },
        { id: 4, title: "Resultat", details: "Results Details" },
        { id: 5, title: "Statistik", details: "Statistics Details" },
      ]);

      console.log("personalBests", personalBests)

       useEffect(() => {

        setPersonalBests(userObj?.profile?.personalBests)

      }, [userObj])  

      const toggleExpand = (itemId, e) => {
        e.stopPropagation(); 
        if (!addingItemId && expandedItemId === itemId) {
          setExpandedItemId(null); 
        } else if (!addingItemId) {
          setExpandedItemId(itemId); 
        }
      };
      
      
      const toggleAddItem = (e, itemId) => {
        e.stopPropagation(); 
        if (addingItemId === itemId) {
            setAddingItemId(null); 
            setStep(1)
        } else {
            setAddingItemId(itemId); 
        }
      }

      const handleChanges = (event, setter) => {
        setter(event.target.value)
      }

      const formatDate = (dateString) => {
        const dateObj = new Date(dateString);
        const formattedDate = dateObj.toLocaleDateString('sv-SE', {
          day: '2-digit',
          month: '2-digit',
        });
    
        const formattedYear = dateObj.getFullYear().toString().slice(2)
    
        const [month, day, year] = formattedDate.split('/').map(part => parseInt(part, 10));
        const formattedMonth = month < 10 ? month.toString() : month;
        const formattedDay = day < 10 ? day.toString() : day;
      
    
      
        return `${formattedMonth}/${formattedDay}-${formattedYear}`;
      };

      const handleNext = () => {
        setAnimation('slideInFromRight');
        setStep(prevStep => prevStep + 1);
      };
      
      const handleBack = () => {
        setAnimation('slideInFromLeft');
        setStep(prevStep => prevStep - 1);
      };
        
      const savePb = async () => {
        const newPb = {
            event,
            performance: pb,
            unit,
            date,
            insideOutside: setting,
            weight: pbWeight
        };
    
        try {
            const token = localStorage.getItem("token"); 
            const response = await fetch(`http://192.168.0.30:5000/add-pb/${user._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ newPb })
            });
    
            const result = await response.json();
            if (response.ok) {
                console.log('Personal best added successfully:', result);
                setEvent("");
                setPb("");
                setUnit("");
                setDate("");
                setSetting("");
                setPbWeight("");
                setAddingItemId(null)
            } else {
                console.error('Failed to add personal best:', result);
            }
        } catch (error) {
            console.error('Error adding personal best:', error);
        }
    };


  return (
    <div>
                {profileItems.map(item => (
            <div className={`profile-item ${expandedItemId === item.id ? "expanded" : ""}`} key={item.id} onClick={(e) => toggleExpand(item.id, e)}>    
                <h3>{item.title}</h3>
                {item.title !== "Tävlingar" && item.title !== "Resultat" && item.title !== "Statistik" && (
                    <div className={`details-container ${expandedItemId === item.id ? "expanded" : ""}`}>
                        {expandedItemId === item.id && item.details.map((detail, index) => (
                            <div className="detail" key={index}>
                                <p className="bold-paragraph">{detail.event}: </p>
                                <p>{`${detail.performance}${detail.unit}`}</p>
                                <p>{formatDate(detail.date)}</p>
                                <p>{detail.outside ? "Utomhus" : "Inomhus"}</p>
                            </div>
                        ))}
                    {addingItemId === item.id && (
                              <div className="add-result-wrapper">

                                 <div className="add-item-header">
                                  <h3>Nytt PB</h3>
                                  <FontAwesomeIcon onClick={toggleAddItem} className="delete-icon" icon={faTrash}></FontAwesomeIcon>
                                  </div>


                              <div className="add-result">
                        
                                {step === 1 && 
                                <div className="step-container">
                                  <div className="step-content" key={step} style={{ animationName: animation }}>
                                  <div className="add-item-inputs">
                                    <span className="item-input">
                                       <label for="event">Gren/övning</label>
                                       <input type="text" id="event-input" name="event" placeholder="T.ex. höjdhopp" onChange={(e) => handleChanges(e, setEvent)}/>
                                   </span>

                                   <span className="item-input">
                                     <label for="result">Fyll i resultat</label>
                                  <input type="number" name="result" id="result-input" placeholder="T.ex. 1.80" onChange={(e) => handleChanges(e, setPb)}/>
                                  </span>

                                  <span className="item-input">
                                    <label for="unit">Välj enhet</label>
                                  <select className="setting-select" id="unit" name="unit" onChange={(e) => handleChanges(e, setUnit)}>
                                      <option value="">m/s/kg</option>
                                      <option value="m">m</option>
                                      <option value="cm">cm</option>
                                      <option value="s">sekunder</option>
                                      <option value="min">minuter</option>
                                      <option value="kg">kg</option>
                                   </select>
                                   </span>
                                   </div>

                              <div className="add-result-button">
                                <button onClick={handleBack}>Tillbaka</button>
                                 <button onClick={handleNext}>Nästa</button>
                                 </div>
                                 </div>
                                 </div>
                             }
                        
                             
                             
                             {step === 2 &&
                             <div className="step-container">
                                <div className="step-content" key={step} style={{ animationName: animation }}>
                                   <div className="add-item-inputs" >
                                  <span className="item-input">
                                    <label for="date">Välj datum</label>
                              <input type="date" name="date" onChange={(e) => handleChanges(e, setDate)} />
                              </span>
                              <span className="item-input">
                                <label for="setting">Ute eller inne?</label>
                              <select className="setting-select" name="setting" onChange={(e) => handleChanges(e, setSetting)}>
                              <option value="">Ute/inne</option>
                                <option value="Utomhus">Utomhus</option>
                                <option value="Inomhus">Inomhus</option>
                                </select>
                                </span>
                                </div>

                                <div className="add-result-button">
                              <button onClick={handleBack}>Tillbaka</button>
                                 <button onClick={handleNext}>Nästa</button>
                                 </div>
                                 </div>
                                 </div>
                                  }
                         
                            
                             {step === 3 &&
                             <div className="step-container">
                               <div className="step-content" key={step} style={{ animationName: animation }}>
                                <div className="add-item-inputs">
                              <span className="item-input">
                                <label for="weight">Vad vägde du vid tillfället?</label>
                                <input type="text" id="pb-weight-input" value={pbWeight} placeholder="Vikt i kg" onChange={(e) => handleChanges(e, setPbWeight)}/>
                                </span>
                                </div>
                                <div className="add-result-button">
                              <button onClick={handleBack}>Tillbaka</button>
                                 <button onClick={savePb}>Spara</button>
                                 </div>
                                 </div>
                                 </div>
                                  }


                                  </div>
                                </div>
                                )}
                            
                           </div>
                     )}

                {expandedItemId === item.id && (
                    <div id="add-icon-span" onClick={(e) => toggleAddItem(e, item.id)}>
                        <FontAwesomeIcon id="add-icon" icon={faPlus} />
                    </div>
                )}

            </div>
        ))}
        <div> 
                     {personalBests.map((pb, index) => (
                <div key={index} className={`profile-item ${expandedItemId === index ? "expanded" : ""}`} onClick={(e) => toggleExpand(index, e)}>
                    <h3>{pb.event}</h3>
                    <div className={`details-container ${expandedItemId === index ? "expanded" : ""}`}>
                        <div className="detail">
                            <p className="bold-paragraph">{pb.event}:</p>
                            <p>{`${pb.performance} ${pb.unit}`}</p>
                            <p>{formatDate(pb.date)}</p>
                            <p>{pb.insideOutside === 'Inomhus' ? 'Inomhus' : 'Utomhus'}</p>
                        </div>
                        {addingItemId === index && (
                            <div className="add-result-wrapper">
                                {/* Komponent för att lägga till nytt PB, liknande ovan */}
                            </div>
                        )}
                    </div>
                </div>
            ))}</div>
    </div>
  )
}



