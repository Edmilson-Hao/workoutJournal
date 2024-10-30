if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
        }).catch(error => {
            console.log('Falha ao registrar o Service Worker:', error);
        });
    });
}

const workoutsKey = 'workouts';

document.addEventListener('DOMContentLoaded', loadWorkouts);

function loadWorkouts() {
    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const list = document.getElementById('workout-list');
    list.innerHTML = '';
    workouts.forEach(workout => {
        const li = document.createElement('li');
        li.innerHTML = `<a href="#" onclick="showWorkoutDetails('${workout.id}')">${workout.name} - ${workout.date}</a>`;
        list.appendChild(li);
    });
}

function showCreateWorkout() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('create-workout').classList.remove('hidden');
    document.getElementById('last-workout').innerHTML = ''; // Limpa a seção de último treino
}

function cancelCreate() {
    document.getElementById('create-workout').classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
    document.getElementById('exercises').innerHTML = '';
    document.getElementById('workout-type').selectedIndex = 0;
}

function showExercises() {
    const type = document.getElementById('workout-type').value;
    const exercisesContainer = document.getElementById('exercises');
    exercisesContainer.innerHTML = '';

    const exercises = {
        'Treino 1': ['Supino Inclinado com Halteres', 'Supino Vertical', 'Cross Over Polia Alta', 'Elevação Lateral', 'Tríceps Francês', 'Tríceps Pulley'],
        'Treino 2': ['Agachamento Barra', 'Leg Press', 'Extensora', 'Elevação Pélvica', 'Flexora Deitada', 'Stiff'],
        'Treino 3': ['Barra Fixa', 'Remada Curvada Pronada', 'Remada Sentada Neutra', 'Face Pull', 'Rosca Scott', 'Rosca Martelo']
    };

    exercises[type].forEach(exercise => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label>${exercise}</label><br>
            <input type="number" placeholder="Série 1 - Peso">
            <input type="number" placeholder="Série 1 - Repetições">
            <input type="number" placeholder="Série 2 - Peso">
            <input type="number" placeholder="Série 2 - Repetições">
            <input type="number" placeholder="Série 3 - Peso">
            <input type="number" placeholder="Série 3 - Repetições"><br>
            <label>Execução:</label>
            <label><input type="radio" name="execution-${exercise}" value="Boa"> Boa Execução</label>
            <label><input type="radio" name="execution-${exercise}" value="Ruim"> Execução Ruim</label>
        `;
        exercisesContainer.appendChild(div);
    });

    showLastWorkout(type); // Exibe os dados do último treino
}

function showLastWorkout(type) {
    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const lastWorkout = workouts.reverse().find(workout => workout.name === type);
    const lastWorkoutContainer = document.getElementById('last-workout');

    if (lastWorkout) {
        let lastWorkoutHTML = `<h3>Último treino (${lastWorkout.date}):</h3>`;
        lastWorkout.exercises.forEach(exercise => {
            const executionText = exercise.execution === 'N/A' ? 'Execução não registrada' : exercise.execution;
            lastWorkoutHTML += `
                <p><strong>${exercise.name}:</strong> ${exercise.data.join(', ')}<br>
                <strong>Execução:</strong> ${executionText}</p>
            `;
        });
        lastWorkoutContainer.innerHTML = lastWorkoutHTML;
    } else {
        lastWorkoutContainer.innerHTML = '<p>Nenhum treino anterior encontrado.</p>';
    }
}




function saveWorkout() {
    const workoutType = document.getElementById('workout-type').value;
    const exercisesElements = Array.from(document.querySelectorAll('.exercises > div'));
    const exercises = exercisesElements.map(div => {
        const inputs = div.querySelectorAll('input[type="number"]');
        const data = Array.from(inputs).map(input => input.value).filter(value => value);

        // Captura a escolha de execução dos radio-buttons corretamente
        const execution = div.querySelector(`input[name="execution-${div.querySelector('label').innerText}"]:checked`);
        const executionValue = execution ? execution.value : 'N/A';

        return {
            name: div.querySelector('label').innerText,
            data: data,
            execution: executionValue
        };
    });

    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const newWorkout = {
        id: Date.now(),
        name: workoutType,
        date: new Date().toLocaleDateString(),
        exercises,
    };
    workouts.push(newWorkout);
    localStorage.setItem(workoutsKey, JSON.stringify(workouts));

    cancelCreate();
    loadWorkouts();
}





function showWorkoutDetails(id) {
    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const workout = workouts.find(w => w.id == id);
    const table = document.getElementById('details-table');
    table.innerHTML = `<tr><th>Exercício</th><th>Dados</th><th>Tonelagem Total</th><th>Execução</th></tr>`;
    
    workout.exercises.forEach((exercise, index) => {
        const repsAndWeights = exercise.data.reduce((acc, value, idx) => {
            if (idx % 2 === 0) {
                const weight = parseFloat(value);
                const reps = parseFloat(exercise.data[idx + 1]);
                if (reps) {
                    acc.push(`${reps}@${weight} kg`);
                }
            }
            return acc;
        }, []);

        const totalTonelagem = exercise.data.reduce((acc, value, idx) => {
            if (idx % 2 === 0) {
                const weight = parseFloat(value);
                const reps = parseFloat(exercise.data[idx + 1]);
                return acc + (weight * reps);
            }
            return acc;
        }, 0);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exercise.name}</td>
            <td>
                <input type="text" value="${exercise.data.join(', ')}" disabled id="data-${index}">
            </td>
            <td>${totalTonelagem} kg</td>
            <td>
                <select id="execution-${index}" disabled>
                    <option value="Boa Execução" ${exercise.execution === 'Boa Execução' ? 'selected' : ''}>Boa Execução</option>
                    <option value="Execução Ruim" ${exercise.execution === 'Execução Ruim' ? 'selected' : ''}>Execução Ruim</option>
                </select>
            </td>
        `;
        table.appendChild(row);
    });

    // Evita adicionar botões duplicados
    if (!document.getElementById('edit-button')) {
        const editButton = document.createElement('button');
        editButton.innerText = 'Editar';
        editButton.id = 'edit-button';
        editButton.onclick = enableEditing;
        table.parentElement.appendChild(editButton);
    }

    if (!document.getElementById('save-button')) {
        const saveButton = document.createElement('button');
        saveButton.innerText = 'Salvar';
        saveButton.style.display = 'none';
        saveButton.id = 'save-button';
        saveButton.onclick = () => saveEdits(id);
        table.parentElement.appendChild(saveButton);
    }

    document.getElementById('home').classList.add('hidden');
    document.getElementById('workout-details').classList.remove('hidden');
}


function enableEditing() {
    const table = document.getElementById('details-table');
    Array.from(table.querySelectorAll('input, select')).forEach(input => {
        input.disabled = false;
    });
    document.getElementById('save-button').style.display = 'inline';
}



function saveEdits(id) {
    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const workoutIndex = workouts.findIndex(w => w.id == id);

    const table = document.getElementById('details-table');
    const updatedExercises = Array.from(table.querySelectorAll('tr')).slice(1).map((row, index) => {
        const dataInput = row.querySelector(`#data-${index}`).value.split(',').map(item => item.trim()).filter(item => item); // Remove valores vazios
        const parsedData = dataInput.flatMap(data => {
            const [reps, weight] = data.split('@').map(item => item.trim().replace('kg', ''));
            return [weight, reps].filter(value => value); // Remove qualquer valor vazio
        });

        const executionSelect = row.querySelector(`#execution-${index}`).value;

        return {
            name: workouts[workoutIndex].exercises[index].name,
            data: parsedData,
            execution: executionSelect
        };
    });

    workouts[workoutIndex].exercises = updatedExercises;
    localStorage.setItem(workoutsKey, JSON.stringify(workouts));

    Array.from(table.querySelectorAll('input, select')).forEach(input => {
        input.disabled = true;
    });
    document.getElementById('save-button').style.display = 'none';
    alert('Alterações salvas com sucesso!');
}





function showHome() {
    document.getElementById('workout-details').classList.add('hidden');
    document.getElementById('home').classList.remove('hidden');
}

function resetData() {
    localStorage.removeItem(workoutsKey);
    loadWorkouts();
}

function exportData() {
    const workouts = localStorage.getItem(workoutsKey);
    const blob = new Blob([workouts], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workouts.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = readerEvent => {
            const content = readerEvent.target.result;
            localStorage.setItem(workoutsKey, content);
            loadWorkouts();
        };
        reader.readAsText(file);
    };
    input.click();
}
