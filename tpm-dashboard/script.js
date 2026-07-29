import { programs } from "./data/programs.js";

let currentProgram = "search";

const programSelect = document.getElementById("programSelect");

const programTitle = document.getElementById("programTitle");
const programSubtitle = document.getElementById("programSubtitle");

const budget = document.getElementById("budget");
const timeline = document.getElementById("timeline");
const engineeringTeams = document.getElementById("engineeringTeams");

const statusLabel = document.getElementById("statusLabel");
const statusDescription = document.getElementById("statusDescription");

const durationMini = document.getElementById("durationMini");
const teamsMini = document.getElementById("teamsMini");
const complexityMini = document.getElementById("complexityMini");


const problemStatement = document.getElementById("problemStatement");
const objectiveList = document.getElementById("objectiveList");
const technicalScope = document.getElementById("technicalScope");
const expectedOutcomes = document.getElementById("expectedOutcomes");


const architectureDiagram =
    document.getElementById("architectureDiagram");

const stakeholderGrid =
    document.getElementById("stakeholderGrid");

const dependencyList =
    document.getElementById("dependencyList");

const criticalPath =
    document.getElementById("criticalPath");


const riskTableBody =
    document.getElementById("riskTableBody");

const riskScore =
    document.getElementById("riskScore");

const riskSummary =
    document.getElementById("riskSummary");

const riskActions =
    document.getElementById("riskActions");


const timelineContainer =
    document.getElementById("timelineContainer");


const kpiGrid =
    document.getElementById("kpiGrid");


const executiveSummary =
    document.getElementById("executiveSummary");

function clear(element){

    if(element){

        element.innerHTML = "";

    }

}


function createList(element, items){

    clear(element);


    if(!items || !Array.isArray(items)){

        console.warn("Missing list data:", items);

        return;

    }


    items.forEach(item=>{

        const li = document.createElement("li");

        li.textContent = item;

        element.appendChild(li);

    });

}


const tabs =
    document.querySelectorAll(".tab");


const tabContents =
    document.querySelectorAll(".tab-content");


tabs.forEach(tab=>{


    tab.addEventListener("click",()=>{


        tabs.forEach(btn=>{

            btn.classList.remove("active");

        });


        tabContents.forEach(section=>{

            section.classList.remove("active");

        });



        tab.classList.add("active");


        const target =
            document.getElementById(tab.dataset.tab);


        if(target){

            target.classList.add("active");

        }


    });


});


programSelect.addEventListener("change",(event)=>{


    currentProgram =
        event.target.value;


    renderProgram(currentProgram);


});


function renderHeader(program){


    programTitle.textContent =
        program.executive.title;


    programSubtitle.textContent =
        program.executive.subtitle;


    budget.textContent =
        program.executive.budget;


    timeline.textContent =
        program.executive.timeline;


    engineeringTeams.textContent =
        program.stakeholders.length;



    statusLabel.textContent =
        program.executive.status;


    statusDescription.textContent =
        program.executive.statusDescription;



    durationMini.textContent =
        program.executive.duration;


    teamsMini.textContent =
        program.stakeholders.length;


    complexityMini.textContent =
        program.executive.complexity;


}


function renderSummary(program){


    problemStatement.textContent =
        program.summary.problem;



    createList(

        objectiveList,

        program.summary.objectives

    );



    createList(

        technicalScope,

        program.summary.technicalScope

    );



    createList(

        expectedOutcomes,

        program.summary.expectedOutcomes

    );


}


function renderArchitecture(program){


    clear(architectureDiagram);



    program.architecture.forEach(node=>{


        const card =
            document.createElement("div");


        card.className =
            `architecture-node ${node.type}`;



        card.innerHTML = `

            <h3>${node.title}</h3>

            <p>${node.description}</p>

        `;



        architectureDiagram.appendChild(card);


    });


}


function renderStakeholders(program){


    clear(stakeholderGrid);



    program.stakeholders.forEach(person=>{


        const card =
            document.createElement("div");


        card.className =
            "stakeholder-card";



        card.innerHTML = `

            <h3>${person.team}</h3>

            <strong>${person.owner}</strong>

            <p>${person.role}</p>

        `;



        stakeholderGrid.appendChild(card);


    });


}

function renderDependencies(program){


    clear(dependencyList);

    clear(criticalPath);



    program.dependencies.forEach(dep=>{


        const item =
            document.createElement("div");


        item.className =
            "dependency-item";



        item.innerHTML = `

            <strong>${dep.name}</strong>

            <span>${dep.status}</span>

        `;



        dependencyList.appendChild(item);



    });



    const critical =
        program.dependencies
        .filter(dep=>dep.status !== "Complete");



    critical.forEach(item=>{


        const step =
            document.createElement("div");


        step.className =
            "critical-step";


        step.textContent =
            item.name;



        criticalPath.appendChild(step);


    });


}


function renderRisks(program){


    clear(riskTableBody);

    clear(riskActions);



    program.risks.forEach(risk=>{


        const row =
            document.createElement("tr");



        row.innerHTML = `

            <td>${risk.risk}</td>

            <td>${risk.probability}</td>

            <td>${risk.impact}</td>

            <td>${risk.owner}</td>

            <td>${risk.mitigation}</td>

        `;



        riskTableBody.appendChild(row);



        const action =
            document.createElement("li");


        action.textContent =
            `${risk.risk}: ${risk.mitigation}`;



        riskActions.appendChild(action);



    });



    const highRisk =
        program.risks.filter(

            risk =>
            risk.impact === "High"

        ).length;



    const score =
        Math.min(

            95,

            50 + (highRisk * 12)

        );



    riskScore.textContent =
        score;



    riskSummary.textContent =

        score >= 75

        ?

        "Higher technical risk due to multiple cross-team dependencies."

        :

        "Moderate technical risk with manageable dependencies.";

}


function renderRoadmap(program){


    clear(timelineContainer);



    program.roadmap.forEach((phase,index)=>{


        const step =
            document.createElement("div");


        step.className =
            "timeline-step";



        step.innerHTML = `

            <div class="timeline-dot">

                ${index + 1}

            </div>


            <h4>${phase}</h4>


            <p>

                Program phase ${index + 1}

            </p>

        `;



        timelineContainer.appendChild(step);



    });


}


function renderKPIs(program){


    clear(kpiGrid);



    program.kpis.forEach(kpi=>{


        const card =
            document.createElement("div");


        card.className =
            "kpi-card";



        card.innerHTML = `

            <h3>${kpi.name}</h3>


            <div class="kpi-value">

                ${kpi.target}

            </div>


            <div class="kpi-target">

                Target Outcome

            </div>


            <div class="progress">

                <div 

                    class="progress-fill"

                    style="width:75%">

                </div>

            </div>

        `;



        kpiGrid.appendChild(card);


    });


}


function renderExecutiveSummary(program){


    clear(executiveSummary);



    const items = [

        {

            title:"Business Value",

            text:program.summary.businessValue

        },

        {

            title:"Program Complexity",

            text:program.executive.complexity

        },

        {

            title:"Timeline",

            text:program.executive.timeline

        },

        {

            title:"Investment",

            text:program.executive.budget

        }

    ];



    items.forEach(item=>{


        const card =
            document.createElement("div");


        card.className =
            "executive-item";



        card.innerHTML = `

            <h4>${item.title}</h4>

            <p>${item.text}</p>

        `;



        executiveSummary.appendChild(card);



    });


}


function renderProgram(programKey){


    const program =
        programs[programKey];



    if(!program){

        console.error(

            "Program not found:",

            programKey

        );

        return;

    }



    renderHeader(program);


    renderSummary(program);


    renderArchitecture(program);


    renderStakeholders(program);


    renderDependencies(program);


    renderRisks(program);


    renderRoadmap(program);


    renderKPIs(program);


    renderExecutiveSummary(program);


}


document.addEventListener(

    "DOMContentLoaded",

    ()=>{


        renderProgram(currentProgram);


    }

);

