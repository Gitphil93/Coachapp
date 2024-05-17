import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import "../styles/profileItems.css"


export default function ProfileItems({user, personalBestsObj, seasonBestsObj}) {
    const [event, setEvent] = useState("")
    const [pb, setPb] = useState(0)
    const [pbWeight, setPbWeight] = useState("")
    const [date, setDate] = useState("")
    const [setting, setSetting] = useState("")
    const [unit, setUnit] =useState("")
    const [step, setStep] = useState(1)
    const [addPb, setAddPb] = useState(false)
    const [addSb, setAddSb] = useState(false)
    const [sbEvent, setSbEvent] = useState("")
    const [sb, setSb] = useState(0)
    const [sbWeight, setSbWeight] = useState("")
    const [sbDate, setSbDate] = useState("")
    const [sbSetting, setSbSetting] = useState("")
    const [sbUnit, setSbUnit] =useState("")
    const [sbStep, setSbStep] = useState(1)
    const [animation, setAnimation] = useState("slideInFromRight")
    const [personalBests, setPersonalBests] = useState([])
    const [seasonBests, setSeasonBests] = useState([])

    const [expandedSections, setExpandedSections] = useState({
        pb: false,
        sb: false,
        competitions: false
    });

      console.log("personalBests", personalBests)
      console.log("seasonBests", seasonBests)

       useEffect(() => {
           if(personalBestsObj){
        setPersonalBests(personalBestsObj)
           }
           if(seasonBestsObj) {
            setSeasonBests(seasonBestsObj)
           }
      }, [personalBestsObj, seasonBestsObj])  

      const toggleExpand = (e, sectionKey) => {
        e.stopPropagation();
        if (addPb || addSb) return; 

        setExpandedSections(prev => ({
            ...{
                pb: false,
                sb: false,
                competitions: false
            },
            [sectionKey]: !prev[sectionKey]
        }));
    };
      
      
    const toggleAddItem = (e, addKey) => {
        e.stopPropagation(); 
       
    
        // Toggle adding based on addKey if needed, similar to the above example
        // This assumes addKey determines which section's add state is being toggled
        if (addKey === 'pb') {
            setAddPb(!addPb);
        } else if (addKey === 'sb') {
            setAddSb(!addSb);
        }
        setStep(1);
    };

      const handleChanges = (event, setter) => {
          event.stopPropagation()
        setter(event.target.value)
      }

      const formatDate = (dateString) => {
          if (dateString === "") return
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

      

      const handleNext = (e) => {
          e.stopPropagation()
        setAnimation('slideInFromRight');
        setStep(prevStep => prevStep + 1);
      };
      
      const handleBack = (e) => {
          e.stopPropagation()
        setAnimation('slideInFromLeft');
        setStep(prevStep => prevStep - 1);
      };
        
      const savePb = async (e) => {
          e.stopPropagation()
          if (event.trim() === "" || pb.trim() === "" || unit === "") return
        const newPb = {
            event: event.trim().charAt(0).toUpperCase() + event.trim().slice(1).toLowerCase(),
            performance: pb.trim(),
            unit: unit,
            date: date,
            insideOutside: setting,
            weight: pbWeight.trim()
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
            console.log(result)
            if (response.ok) {
                console.log('Personal best added successfully:', result);
                setPersonalBests(prevBests => [...prevBests, result.newPb])
                setEvent("");
                setPb("");
                setUnit("");
                setDate("");
                setSetting("");
                setPbWeight("");
                setAddPb(false)
                setStep(1)
            } else {
                console.error('Failed to add personal best:', result);
            }
        } catch (error) {
            console.error('Error adding personal best:', error);
        }
    };


    const saveSb = async (e) => {
        e.stopPropagation()
        if (sbEvent.trim() === "" || sb.trim() === "" || sbUnit === "") return

      const newSb = {
          event: sbEvent.trim().charAt(0).toUpperCase() + sbEvent.trim().slice(1).toLowerCase(),
          performance: sb.trim(),
          unit: sbUnit,
          date: sbDate,
          insideOutside: sbSetting,
          weight: sbWeight.trim()
      };
  
      try {
          const token = localStorage.getItem("token"); 
          const response = await fetch(`http://192.168.0.30:5000/add-sb/${user._id}`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ newSb })
          });
  
          const result = await response.json();
          console.log(result)
          if (response.ok) {
              console.log('Personal best added successfully:', result);
              setSeasonBests(prevBests => [...prevBests, result.newSb])
              setSbEvent("");
              setSb("");
              setSbUnit("");
              setSbDate("");
              setSbSetting("");
              setSbWeight("");
              setAddSb(false)
              setSbStep(1)
          } else {
              console.error('Failed to add season best:', result);
          }
      } catch (error) {
          console.error('Error adding season best:', error);
      }
  };


                const stopPropagation = (e) => {
                e.stopPropagation()
                }
  return (
        <div>
        <div className={`profile-item ${expandedSections.pb ? "expanded" : ""}`} onClick={(e) => toggleExpand(e,'pb')}>
                <div className="item-header-wrapper">
                <h3 className={`item-header ${expandedSections.pb ? "expanded" : ""}`}>Personbästan</h3>
                </div>
                {expandedSections.pb && (
                    <div className={`details-container ${expandedSections.pb ? "expanded" : ""}`}>
                        
                        {!addPb && personalBests.map((pb, index) => (
                            <div className="detail" key={index}>
                                <p className="bold-paragraph">{pb.event}: </p>
                                <p>{`${pb.performance}${pb.unit}`}</p>
                                <p className='date-paragraph'>{formatDate(pb.date) || "-"}</p>
                                <p className='setting-paragraph'>{pb.insideOutside || "-"}</p>
                            </div>
                        ))}
                                            {addPb && (
                              <div className="add-result-wrapper" onClick={(e) => stopPropagation(e)}>

                                 <div className="add-item-header">
                                  <h3>Nytt PB</h3>
                                  <FontAwesomeIcon onClick={(e) => toggleAddItem(e,"pb")} className="delete-icon" icon={faTrash}></FontAwesomeIcon>
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
                                  <input type="text" name="result" id="result-input" placeholder="T.ex. 1.80" onChange={(e) => handleChanges(e, setPb)}/>
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
                              <option value="">Välj</option>
                                <option value="Utomhus">Utomhus</option>
                                <option value="Inomhus">Inomhus</option>
                                </select>
                                </span>
                                </div>

                                <div className="add-result-button">
                              <button onClick={(e) => handleBack(e)}>Tillbaka</button>
                                 <button onClick={(e)=> handleNext(e)}>Nästa</button>
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
                              <button onClick={(e) => handleBack(e)}>Tillbaka</button>
                                 <button onClick={(e) => savePb(e)}>Spara</button>
                                 </div>
                                 </div>
                                 </div>
                                  }


                                  </div>
                                </div>
                                )}
                    </div>
                )}

            {expandedSections.pb && (
                    <div id="add-icon-span" onClick={(e) => toggleAddItem(e ,"pb")}>
                        <FontAwesomeIcon id="add-icon" icon={faPlus} />
                    </div>
                )}
            </div>

            <div className={`profile-item ${expandedSections.sb ? "expanded" : ""}`} onClick={(e) => toggleExpand(e,'sb')}>
                <div className="item-header-wrapper">
                <h3 className={`item-header ${expandedSections.sb ? "expanded" : ""}`}>Säsongsbästan</h3>
                </div>
                {expandedSections.sb && (
                    <div className={`details-container ${expandedSections.sb ? "expanded" : ""}`}>
                        
                        {!addSb && seasonBests.map((sb, index) => (
                            <div className="detail" key={index}>
                                <p className="bold-paragraph">{sb.event}: </p>
                                <p>{`${sb.performance}${sb.unit}`}</p>
                                <p className='date-paragraph'>{sb.date ? sb.date.slice(0, 4) : "-"}</p>
                                <p className='setting-paragraph'>{sb.insideOutside || "-"}</p>
                            </div>
                        ))}
                                            {addSb && (
                              <div className="add-result-wrapper" onClick={(e) => stopPropagation(e)}>

                                 <div className="add-item-header">
                                  <h3>Nytt säsongsbästa</h3>
                                  <FontAwesomeIcon onClick={(e) => toggleAddItem(e,"sb")} className="delete-icon" icon={faTrash}></FontAwesomeIcon>
                                  </div>


                              <div className="add-result">
                        
                                {step === 1 && 
                                <div className="step-container">
                                  <div className="step-content" key={step} style={{ animationName: animation }}>
                                  <div className="add-item-inputs">
                                    <span className="item-input">
                                       <label for="event">Gren/övning</label>
                                       <input type="text" id="event-input" name="event" placeholder="T.ex. höjdhopp" onChange={(e) => handleChanges(e, setSbEvent)}/>
                                   </span>

                                   <span className="item-input">
                                     <label for="result">Fyll i resultat</label>
                                  <input type="text" name="result" id="result-input" placeholder="T.ex. 1.80" onChange={(e) => handleChanges(e, setSb)}/>
                                  </span>

                                  <span className="item-input">
                                    <label for="unit">Välj enhet</label>
                                  <select className="setting-select" id="unit" name="unit" onChange={(e) => handleChanges(e, setSbUnit)}>
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
                              <input type="date" name="date" onChange={(e) => handleChanges(e, setSbDate)} />
                              </span>
                              <span className="item-input">
                                <label for="setting">Ute eller inne?</label>
                              <select className="setting-select" name="setting" onChange={(e) => handleChanges(e, setSbSetting)}>
                              <option value="">Välj</option>
                                <option value="Utomhus">Utomhus</option>
                                <option value="Inomhus">Inomhus</option>
                                </select>
                                </span>
                                </div>

                                <div className="add-result-button">
                              <button onClick={(e) => handleBack(e)}>Tillbaka</button>
                                 <button onClick={(e)=> handleNext(e)}>Nästa</button>
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
                                <input type="text" id="pb-weight-input" value={pbWeight} placeholder="Vikt i kg" onChange={(e) => handleChanges(e, setSbWeight)}/>
                                </span>
                                </div>
                                <div className="add-result-button">
                              <button onClick={(e) => handleBack(e)}>Tillbaka</button>
                                 <button onClick={(e) => saveSb(e)}>Spara</button>
                                 </div>
                                 </div>
                                 </div>
                                  }


                                  </div>
                                </div>
                                )}
                    </div>
                )}

            {expandedSections.sb && (
                    <div id="add-icon-span" onClick={(e) => toggleAddItem(e, "sb")}>
                        <FontAwesomeIcon id="add-icon" icon={faPlus} />
                    </div>
                )}
            </div>
            
        </div>
  )
}



