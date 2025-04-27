let constraintCount = 1

function addConstraint() {
    const constraintsDiv = document.getElementById('constraints')
    const newConstraint = document.createElement('div')
    newConstraint.className = 'constraint'
    newConstraint.innerHTML = `
        <input type="number" class="coef-x1" placeholder="x1"> x<sub>1</sub> +
        <input type="number" class="coef-x2" placeholder="x2"> x<sub>2</sub>
    <select class="operator">
        <option value="<=" selected>≤</option>
        <option value=">=">≥</option>
    </select>
    <input type="number" class="const" placeholder="constante">
    `
    constraintsDiv.appendChild(newConstraint)
    constraintCount++
}


function getProblemType() {
    return document.querySelector(".typeProblem").value.toLowerCase()
}

function getZFunction() {
    let zx1 = parseFloat(document.getElementById("z-x1").value)
    let zx2 = parseFloat(document.getElementById("z-x2").value)

    if (isNaN(zx1) || isNaN(zx2)) {
        alert("Função Z inválida!")
        return null
    }

    return { x1: zx1, x2: zx2 }
}

function getConstraints() {
    const constraints = [];

    const constraintElements = document.getElementsByClassName('constraint');

    for (let elem of constraintElements) {
        const coefX1 = elem.querySelector('.coef-x1').value;
        const coefX2 = elem.querySelector('.coef-x2').value;
        const constant = elem.querySelector('.const').value;
        const operator = elem.querySelector('.operator').value;

        if (!coefX1 || !coefX2 || !constant) {
            alert("Preencha todos os campos da restrição!");
            return null;
        }

        constraints.push({
            x: parseFloat(coefX1),
            y: parseFloat(coefX2),
            type: operator,
            rhs: parseFloat(constant)
        });
    }

    const points = findIntersectionPoints(constraints);

    const uniquePoints = Array.from(new Set(points.map(JSON.stringify))).map(JSON.parse);

    return {
        constraints: constraints,
        pontos: uniquePoints
    };
}
function findIntersectionPoints(constraints) {
    const equations = convertConstraintsIntoEquations(constraints)
    const allConstraints = [...constraints,
    { x: 1, y: 0, type: ">=", rhs: 0 },
    { x: 0, y: 1, type: ">=", rhs: 0 }
    ]

    const points = []

    for (let i = 0; i < equations.length; i++) {
        for (let j = i + 1; j < equations.length; j++) {
            const eq1 = equations[i]
            const eq2 = equations[j]

            const denominator = eq1.a * eq2.b - eq2.a * eq1.b
            if (denominator === 0) continue

            const x = (eq2.b * eq1.c - eq1.b * eq2.c) / denominator
            const y = (eq1.a * eq2.c - eq2.a * eq1.c) / denominator

            points.push([Number(x.toFixed(4)), Number(y.toFixed(4))])
        }
    }

    let allPoints =  points.filter(point =>
        allConstraints.every(c => {
            const value = Number(Number(c.x * point[0] + c.y * point[1]).toFixed(0));
            return c.type === "<=" ? value <= c.rhs :
                c.type === ">=" ? value >= c.rhs : true;
        })
    );

    return allPoints.map(e => {
        return [Number(Number(e[0]).toFixed(2)), Number(Number(e[1]).toFixed(2))];
    });
}
function convertConstraintsIntoEquations(constraints) {
    const equations = []
    const allConstraints = [...constraints,
    { x: 1, y: 0, type: ">=", rhs: 0 },
    { x: 0, y: 1, type: ">=", rhs: 0 }
    ]

    for (const c of allConstraints) {
        equations.push({
            a: c.x,
            b: c.y,
            c: c.rhs,
            type: c.type
        })
    }

    return equations
}

function addRow(x1, x2, result) {
    if (!x1 || !x1 || !result) {
        return
    }

    const table = document.getElementById("tableResult").getElementsByTagName('tbody')[0]
    const newRow = table.insertRow()

    newRow.className = result
    const celX1 = newRow.insertCell(0)
    const celX2 = newRow.insertCell(1)
    const celResult = newRow.insertCell(2)

    celX1.innerText = x1
    celX2.innerText = x2
    celResult.innerText = result

}

function calculateSolution() {
    cleanTable()
    const z = getZFunction();
    if (!z) return;

    const result = getConstraints();
    if (!result) return;

    let bestPoint = null;
    let bestValue = getProblemType() === "max" ? -Infinity : Infinity;

    for (const point of result.pontos) {
        addRow(`${z.x1} x (${point[0]}) +`, `${z.x2} x (${point[1]}) = `, `${z.x1 * point[0] + z.x2 * point[1]}`)
        const value = z.x1 * point[0] + z.x2 * point[1];

        if ((getProblemType() === "max" && value > bestValue) ||
            (getProblemType() === "min" && value < bestValue)) {
            bestValue = value;
            bestPoint = point;
        }
    }

    let rowsResult = document.getElementsByClassName(`${bestValue}`)
    console.log(rowsResult)
    for(let i = 0 ; i < rowsResult.length ; i++){
        rowsResult[i].style.backgroundColor = "rgba(240, 240, 35, 0.9)"
    }

    const resultDiv = document.getElementById('result');
    
    let valueType = getProblemType() == "max" ? "Maximização" : "Minimização"
    resultDiv.innerHTML = `
        <h3>Pontos que satisfazem as condições: </h3>
        <p>${result.pontos.map(p => `(${p[0]}, ${p[1]})`).join(', ')}</p>
        
        <h3>Solução: </h3>
        <p>Ponto de ${valueType}: (${bestPoint ? bestPoint.join(', ') : 'N/A'})</p>
        <p>Valor de Z em ${valueType}: ${bestPoint ? bestValue.toFixed(2) : 'N/A'}</p>
    `;
    document.getElementById("tableResult").style.display = "contents"
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
}

function cleanTable() {
    const bodyTable = document.querySelector("#tableResult tbody");
    bodyTable.innerHTML = "";
}
