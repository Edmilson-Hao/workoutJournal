if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
        }).catch(error => {
            console.log('Falha ao registrar o Service Worker:', error);
        });
    });
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