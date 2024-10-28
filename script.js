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
            <label>${exercise}</label>
<br>
            <input type="number" placeholder="Série 1 - Peso">
            <input type="number" placeholder="Série 1 - Repetições">
            <input type="number" placeholder="Série 2 - Peso">
            <input type="number" placeholder="Série 2 - Repetições">
            <input type="number" placeholder="Série 3 - Peso">
            <input type="number" placeholder="Série 3 - Repetições">
        `;
        exercisesContainer.appendChild(div);
    });

    showLastWorkout(type); // Exibe os dados do último treino
}

function showLastWorkout(type) {
    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const lastWorkout = workouts.reverse().find(workout => workout.name === type); // Busca o último treino do tipo selecionado
    const lastWorkoutContainer = document.getElementById('last-workout');

    if (lastWorkout) {
        let lastWorkoutHTML = `<h3>Último treino (${lastWorkout.date}):</h3>`;
        lastWorkout.exercises.forEach(exercise => {
            lastWorkoutHTML += `<p><strong>${exercise.name}:</strong> ${exercise.data.join(', ')}</p>`;
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
        const inputs = div.querySelectorAll('input');
        const data = Array.from(inputs).map(input => input.value).filter(value => value);
        return {
            name: div.querySelector('label').innerText,
            data: data,
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
    table.innerHTML = `<tr><th>Exercício</th><th>Dados</th><th>Tonelagem Total</th></tr>`;
    
    workout.exercises.forEach(exercise => {
        const series = [];
        const weightsAndReps = exercise.data.map((value, index) => {
            if (index % 2 === 0) return parseFloat(value); // Peso
            return null; // Ignora as repetições para o cálculo
        }).filter(weight => weight !== null);

        const repsAndWeights = exercise.data.reduce((acc, value, index) => {
            if (index % 2 === 0) {
                const weight = parseFloat(value);
                const reps = parseFloat(exercise.data[index + 1]);
                if (reps) {
                    acc.push(`${reps}@${weight} kg`);
                }
            }
            return acc;
        }, []);

        const totalTonelagem = weightsAndReps.reduce((acc, weight, index) => {
            const reps = parseFloat(exercise.data[index * 2 + 1]);
            return acc + (weight * reps);
        }, 0);

        const row = document.createElement('tr');
        row.innerHTML = `<td>${exercise.name}</td><td>${repsAndWeights.join(', ')}</td><td>${totalTonelagem} kg</td>`;
        table.appendChild(row);
    });

    // Botão para editar o treino
    const editButton = document.createElement('button');
    editButton.textContent = 'Editar Treino';
    editButton.onclick = () => editWorkout(id);
    document.getElementById('workout-details').appendChild(editButton);
    
    document.getElementById('home').classList.add('hidden');
    document.getElementById('workout-details').classList.remove('hidden');
}

function editWorkout(id) {
    const workouts = JSON.parse(localStorage.getItem(workoutsKey)) || [];
    const workout = workouts.find(w => w.id == id);

    // Implementar lógica para exibir o formulário de edição com os dados do treino
    // Exemplo: preencher campos com `workout.name`, `workout.date`, `workout.exercises`, etc.
    // Após editar, salvar as mudanças no localStorage e recarregar a lista de treinos.

    alert(`Função de edição para o treino ${id} ainda não implementada.`);
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
