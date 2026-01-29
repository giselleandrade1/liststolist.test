/* eslint-disable no-restricted-globals */

const computeCriticalPath = (tasks) => {
    const adj = new Map();
    const indegree = new Map();
    const duration = new Map();

    tasks.forEach(task => {
        adj.set(task.id, []);
        indegree.set(task.id, 0);
        duration.set(task.id, task.estimatedMinutes || 0);
    });

    tasks.forEach(task => {
        task.dependencies.forEach(dep => {
            if (adj.has(dep)) {
                adj.get(dep).push(task.id);
                indegree.set(task.id, (indegree.get(task.id) || 0) + 1);
            }
        });
    });

    const queue = [];
    indegree.forEach((deg, id) => {
        if (deg === 0) queue.push(id);
    });

    const longest = new Map();
    queue.forEach(id => longest.set(id, duration.get(id)));

    while (queue.length) {
        const current = queue.shift();
        const base = longest.get(current) || 0;
        (adj.get(current) || []).forEach(next => {
            const candidate = base + (duration.get(next) || 0);
            longest.set(next, Math.max(longest.get(next) || 0, candidate));
            indegree.set(next, (indegree.get(next) || 0) - 1);
            if (indegree.get(next) === 0) queue.push(next);
        });
    }

    let max = 0;
    longest.forEach(value => {
        if (value > max) max = value;
    });

    return max;
};

const computeHeatmap = (tasks) => {
    const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
    tasks.forEach(task => {
        const date = new Date(task.createdAt);
        const day = date.getDay();
        const hour = date.getHours();
        grid[day][hour] += 1;
    });
    return grid;
};

self.onmessage = (event) => {
    const { type, payload } = event.data || {};
    if (type === 'ANALYZE') {
        const criticalPath = computeCriticalPath(payload.tasks || []);
        const heatmap = computeHeatmap(payload.tasks || []);
        self.postMessage({ type: 'RESULT', payload: { criticalPath, heatmap } });
    }
};
