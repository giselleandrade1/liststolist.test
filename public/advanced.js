(() => {
    'use strict';

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => Array.from(document.querySelectorAll(selector));
    const now = () => new Date();
    const toIso = (date) => new Date(date).toISOString();

    const log = (event, payload = {}) => {
        const entry = { event, ts: toIso(now()), ...payload };
        console.info(JSON.stringify(entry));
        const logEl = $('#advancedLog');
        if (logEl) {
            logEl.textContent = `${entry.ts} • ${event}`;
        }
    };

    const locale = navigator.language || 'pt-BR';
    const dict = {
        'pt-BR': {
            added: 'Tarefa adicionada',
            forecast: 'Previsão de conclusão',
            tasks: 'tarefas'
        },
        'en-US': {
            added: 'Task added',
            forecast: 'Completion forecast',
            tasks: 'tasks'
        }
    };

    const t = (key) => (dict[locale] && dict[locale][key]) || dict['en-US'][key] || key;

    class DynamicStyles {
        constructor() {
            this.rules = new Map();
            this.styleEl = document.createElement('style');
            this.styleEl.setAttribute('data-dynamic-styles', 'true');
            document.head.appendChild(this.styleEl);
        }

        setRule(key, rule) {
            this.rules.set(key, rule);
            this.flush();
        }

        removeRule(key) {
            this.rules.delete(key);
            this.flush();
        }

        flush() {
            this.styleEl.textContent = Array.from(this.rules.values()).join('\n');
        }
    }

    class CustomHashMap {
        constructor(size = 64) {
            this.size = size;
            this.buckets = Array.from({ length: size }, () => []);
            this.count = 0;
        }

        hash(key) {
            let hash = 5381;
            for (let i = 0; i < key.length; i += 1) {
                hash = ((hash << 5) + hash) + key.charCodeAt(i);
            }
            return Math.abs(hash) % this.size;
        }

        set(key, value) {
            const index = this.hash(String(key));
            const bucket = this.buckets[index];
            const existing = bucket.find(entry => entry[0] === key);
            if (existing) {
                existing[1] = value;
                return;
            }
            bucket.push([key, value]);
            this.count += 1;
            if (this.count > this.size * 0.75) {
                this.resize();
            }
        }

        get(key) {
            const index = this.hash(String(key));
            const bucket = this.buckets[index];
            const entry = bucket.find(item => item[0] === key);
            return entry ? entry[1] : null;
        }

        delete(key) {
            const index = this.hash(String(key));
            const bucket = this.buckets[index];
            const idx = bucket.findIndex(item => item[0] === key);
            if (idx >= 0) {
                bucket.splice(idx, 1);
                this.count -= 1;
                return true;
            }
            return false;
        }

        resize() {
            const oldBuckets = this.buckets;
            this.size *= 2;
            this.buckets = Array.from({ length: this.size }, () => []);
            this.count = 0;
            oldBuckets.forEach(bucket => bucket.forEach(([key, value]) => this.set(key, value)));
        }
    }

    class LinkedListNode {
        constructor(value) {
            this.value = value;
            this.next = null;
            this.prev = null;
        }
    }

    class LinkedList {
        constructor() {
            this.head = null;
            this.tail = null;
        }

        append(value) {
            const node = new LinkedListNode(value);
            if (!this.head) {
                this.head = node;
                this.tail = node;
                return node;
            }
            node.prev = this.tail;
            this.tail.next = node;
            this.tail = node;
            return node;
        }

        moveToFront(node) {
            if (node === this.head) return;
            if (node.prev) node.prev.next = node.next;
            if (node.next) node.next.prev = node.prev;
            if (node === this.tail) this.tail = node.prev;
            node.prev = null;
            node.next = this.head;
            if (this.head) this.head.prev = node;
            this.head = node;
        }

        removeTail() {
            if (!this.tail) return null;
            const node = this.tail;
            if (node.prev) node.prev.next = null;
            this.tail = node.prev;
            if (node === this.head) this.head = null;
            return node;
        }
    }

    class PriorityQueue {
        constructor() {
            this.heap = [];
        }

        enqueue(item, priority) {
            this.heap.push({ item, priority });
            this.bubbleUp(this.heap.length - 1);
        }

        bubbleUp(index) {
            while (index > 0) {
                const parent = Math.floor((index - 1) / 2);
                if (this.heap[parent].priority >= this.heap[index].priority) break;
                [this.heap[parent], this.heap[index]] = [this.heap[index], this.heap[parent]];
                index = parent;
            }
        }

        dequeue() {
            if (!this.heap.length) return null;
            const top = this.heap[0];
            const end = this.heap.pop();
            if (this.heap.length && end) {
                this.heap[0] = end;
                this.sinkDown(0);
            }
            return top.item;
        }

        sinkDown(index) {
            const length = this.heap.length;
            while (true) {
                let largest = index;
                const left = 2 * index + 1;
                const right = 2 * index + 2;
                if (left < length && this.heap[left].priority > this.heap[largest].priority) {
                    largest = left;
                }
                if (right < length && this.heap[right].priority > this.heap[largest].priority) {
                    largest = right;
                }
                if (largest === index) break;
                [this.heap[largest], this.heap[index]] = [this.heap[index], this.heap[largest]];
                index = largest;
            }
        }
    }

    class NaryTreeNode {
        constructor(value) {
            this.value = value;
            this.children = [];
        }

        addChild(node) {
            this.children.push(node);
        }
    }

    class NaryTree {
        constructor(rootValue) {
            this.root = new NaryTreeNode(rootValue);
        }

        find(predicate, node = this.root) {
            if (!node) return null;
            if (predicate(node.value)) return node;
            for (const child of node.children) {
                const found = this.find(predicate, child);
                if (found) return found;
            }
            return null;
        }

        traverse(visitor, node = this.root) {
            if (!node) return;
            visitor(node);
            node.children.forEach(child => this.traverse(visitor, child));
        }
    }

    class ARCCache {
        constructor(limit = 50) {
            this.limit = limit;
            this.t1 = new LinkedList();
            this.t2 = new LinkedList();
            this.b1 = new CustomHashMap();
            this.b2 = new CustomHashMap();
            this.map = new CustomHashMap();
            this.p = 0;
        }

        get(key) {
            const entry = this.map.get(key);
            if (!entry) return null;
            entry.list.moveToFront(entry.node);
            return entry.node.value.value;
        }

        set(key, value) {
            const existing = this.map.get(key);
            if (existing) {
                existing.node.value.value = value;
                existing.list.moveToFront(existing.node);
                return;
            }

            const entry = { key, value };
            if (this.map.count >= this.limit) {
                this.evict();
            }
            const node = this.t1.append(entry);
            this.map.set(key, { node, list: this.t1 });
        }

        evict() {
            const targetList = this.t1;
            const removed = targetList.removeTail();
            if (removed) {
                this.map.delete(removed.value.key);
                this.b1.set(removed.value.key, true);
            }
        }
    }

    class EventBus {
        constructor() {
            this.listeners = new Map();
        }

        on(event, handler) {
            if (!this.listeners.has(event)) this.listeners.set(event, new Set());
            this.listeners.get(event).add(handler);
        }

        off(event, handler) {
            if (this.listeners.has(event)) {
                this.listeners.get(event).delete(handler);
            }
        }

        emit(event, payload) {
            (this.listeners.get(event) || []).forEach(handler => handler(payload));
        }
    }

    class DIContainer {
        constructor() {
            this.registry = new Map();
        }

        register(token, factory) {
            this.registry.set(token, factory);
        }

        resolve(token) {
            const factory = this.registry.get(token);
            if (!factory) throw new Error(`Dependência não registrada: ${token}`);
            return factory(this);
        }
    }

    class PluginKernel {
        constructor() {
            this.plugins = [];
        }

        use(plugin) {
            this.plugins.push(plugin);
        }

        activate(context) {
            this.plugins.forEach(plugin => plugin.activate(context));
        }
    }

    class Task {
        constructor({
            id,
            title,
            description,
            createdAt,
            dueAt,
            estimatedMinutes,
            energy,
            urgency,
            importance,
            dependencies,
            tags,
            status,
            progress,
            confidence,
            locationHint,
            deviceContext,
            moodHint,
            recurrence,
            effortScore,
            categoryId,
            comments,
            sharedWith,
            subtasks
        }) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.createdAt = createdAt;
            this.dueAt = dueAt;
            this.estimatedMinutes = estimatedMinutes;
            this.energy = energy;
            this.urgency = urgency;
            this.importance = importance;
            this.dependencies = dependencies;
            this.tags = tags;
            this.status = status;
            this.progress = progress;
            this.confidence = confidence;
            this.locationHint = locationHint;
            this.deviceContext = deviceContext;
            this.moodHint = moodHint;
            this.recurrence = recurrence;
            this.effortScore = effortScore;
            this.categoryId = categoryId;
            this.comments = comments;
            this.sharedWith = sharedWith;
            this.subtasks = subtasks;
        }
    }

    class TaskFactory {
        static create(title, energy, dueAt) {
            return new Task({
                id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
                title,
                description: 'Gerado automaticamente',
                createdAt: toIso(now()),
                dueAt: dueAt || toIso(now()),
                estimatedMinutes: 30 + Math.floor(Math.random() * 180),
                energy: energy || 5,
                urgency: Math.floor(Math.random() * 10) + 1,
                importance: Math.floor(Math.random() * 10) + 1,
                dependencies: [],
                tags: ['auto'],
                status: 'todo',
                progress: 0,
                confidence: Math.random(),
                locationHint: 'home',
                deviceContext: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
                moodHint: ['calm', 'focused', 'energized'][Math.floor(Math.random() * 3)],
                recurrence: 'none',
                effortScore: Math.floor(Math.random() * 100),
                categoryId: 'root',
                comments: [{ author: 'system', body: '💬 markdown **ok**', ts: toIso(now()) }],
                sharedWith: [],
                subtasks: []
            });
        }
    }

    class EisenhowerStrategy {
        score(task) {
            return task.urgency * task.importance;
        }
    }

    class ParetoStrategy {
        score(task) {
            return Math.round(task.importance * 0.8 + task.energy * 0.2);
        }
    }

    class CustomStrategy {
        score(task) {
            const moodBoost = task.moodHint === 'focused' ? 10 : 0;
            return task.effortScore + moodBoost - task.energy;
        }
    }

    class PriorityEngine {
        constructor(strategies) {
            this.strategies = strategies;
        }

        classify(tasks) {
            const matrix = Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () =>
                    Array.from({ length: 3 }, () =>
                        Array.from({ length: 2 }, () => [])
                    )
                )
            );

            for (let u = 0; u < 3; u += 1) {
                for (let i = 0; i < 3; i += 1) {
                    for (let e = 0; e < 3; e += 1) {
                        for (let c = 0; c < 2; c += 1) {
                            matrix[u][i][e][c] = [];
                        }
                    }
                }
            }

            tasks.forEach(task => {
                const urgencyIndex = Math.min(2, Math.floor(task.urgency / 4));
                const importanceIndex = Math.min(2, Math.floor(task.importance / 4));
                const energyIndex = Math.min(2, Math.floor(task.energy / 4));
                const contextIndex = task.deviceContext === 'mobile' ? 1 : 0;
                matrix[urgencyIndex][importanceIndex][energyIndex][contextIndex].push(task);
            });

            return matrix;
        }

        score(task) {
            return this.strategies.reduce((acc, strategy) => acc + strategy.score(task), 0);
        }
    }

    class CriticalPathEngine {
        static calculate(tasks) {
            const graph = new Map();
            const indegree = new Map();
            const duration = new Map();

            tasks.forEach(task => {
                graph.set(task.id, []);
                indegree.set(task.id, 0);
                duration.set(task.id, task.estimatedMinutes || 0);
            });

            tasks.forEach(task => {
                task.dependencies.forEach(dep => {
                    if (graph.has(dep)) {
                        graph.get(dep).push(task.id);
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
                const neighbors = graph.get(current) || [];
                for (let idx = 0; idx < neighbors.length; idx += 1) {
                    const next = neighbors[idx];
                    const candidate = base + (duration.get(next) || 0);
                    longest.set(next, Math.max(longest.get(next) || 0, candidate));
                    indegree.set(next, (indegree.get(next) || 0) - 1);
                    if (indegree.get(next) === 0) queue.push(next);
                }
            }

            let max = 0;
            longest.forEach(value => {
                if (value > max) max = value;
            });
            return max;
        }

        static pert(optimistic, likely, pessimistic) {
            return (optimistic + 4 * likely + pessimistic) / 6;
        }
    }

    class RoundRobinScheduler {
        constructor(quantum = 25) {
            this.quantum = quantum;
        }

        schedule(tasks) {
            const queue = tasks.map(task => ({ ...task, remaining: task.estimatedMinutes }));
            const timeline = [];
            let time = 0;

            while (queue.length) {
                const task = queue.shift();
                const slice = Math.min(this.quantum + task.energy, task.remaining);
                timeline.push({ id: task.id, start: time, end: time + slice });
                time += slice;
                task.remaining -= slice;
                if (task.remaining > 0) queue.push(task);
            }

            return timeline;
        }
    }

    class LWWElementSet {
        constructor() {
            this.addSet = new Map();
            this.removeSet = new Map();
        }

        add(item, timestamp = Date.now()) {
            this.addSet.set(item.id, { item, timestamp });
        }

        remove(itemId, timestamp = Date.now()) {
            this.removeSet.set(itemId, timestamp);
        }

        values() {
            const result = [];
            this.addSet.forEach(({ item, timestamp }, id) => {
                const removedAt = this.removeSet.get(id) || 0;
                if (timestamp >= removedAt) result.push(item);
            });
            return result;
        }
    }

    class TaskHistory {
        constructor() {
            this.versions = new Map();
        }

        snapshot(task) {
            if (!this.versions.has(task.id)) this.versions.set(task.id, []);
            this.versions.get(task.id).push({ ts: Date.now(), data: { ...task } });
        }

        get(taskId) {
            return this.versions.get(taskId) || [];
        }
    }

    class CryptoVault {
        async encrypt(text) {
            if (!window.crypto?.subtle) return btoa(text);
            const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 128 }, true, ['encrypt', 'decrypt']);
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encoded = new TextEncoder().encode(text);
            const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
            return { cipher: Array.from(new Uint8Array(cipher)), iv: Array.from(iv) };
        }
    }

    class TaskDB {
        constructor() {
            this.db = null;
            this.index = new CustomHashMap();
        }

        async open() {
            if (!('indexedDB' in window)) return null;
            return new Promise((resolve, reject) => {
                const request = indexedDB.open('lembraFacilPro', 1);
                request.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    const store = db.createObjectStore('tasks', { keyPath: 'id' });
                    store.createIndex('title', 'title', { unique: false });
                };
                request.onsuccess = () => {
                    this.db = request.result;
                    resolve(this.db);
                };
                request.onerror = () => reject(request.error);
            });
        }

        async put(task) {
            if (!this.db) return;
            return new Promise((resolve, reject) => {
                const tx = this.db.transaction('tasks', 'readwrite');
                tx.objectStore('tasks').put(task);
                tx.oncomplete = () => resolve(true);
                tx.onerror = () => reject(tx.error);
            });
        }

        async list() {
            if (!this.db) return [];
            return new Promise((resolve) => {
                const tx = this.db.transaction('tasks', 'readonly');
                const request = tx.objectStore('tasks').getAll();
                request.onsuccess = () => resolve(request.result || []);
            });
        }

        buildFullTextIndex(tasks) {
            tasks.forEach(task => {
                const tokens = task.title.toLowerCase().split(/\s+/g);
                tokens.forEach(token => {
                    const current = this.index.get(token) || new Set();
                    current.add(task.id);
                    this.index.set(token, current);
                });
            });
        }

        search(query) {
            const tokens = query.toLowerCase().split(/\s+/g);
            const ids = tokens.reduce((acc, token) => {
                const set = this.index.get(token) || new Set();
                set.forEach(id => acc.add(id));
                return acc;
            }, new Set());
            return Array.from(ids);
        }
    }

    class StateStore {
        constructor() {
            this.eventLog = [];
            this.projection = new Map();
            this.bus = new EventBus();
            this.crdt = new LWWElementSet();
            this.history = new TaskHistory();
        }

        dispatch(command) {
            const event = this.handle(command);
            if (event) {
                this.eventLog.push(event);
                this.apply(event);
                this.bus.emit(event.type, event.payload);
            }
        }

        handle(command) {
            switch (command.type) {
                case 'CREATE_TASK':
                    return { type: 'TASK_CREATED', payload: command.payload, ts: Date.now() };
                case 'UPDATE_STATUS':
                    return { type: 'STATUS_UPDATED', payload: command.payload, ts: Date.now() };
                default:
                    return null;
            }
        }

        apply(event) {
            if (event.type === 'TASK_CREATED') {
                this.projection.set(event.payload.id, event.payload);
                this.crdt.add(event.payload, event.ts);
                this.history.snapshot(event.payload);
            }
            if (event.type === 'STATUS_UPDATED') {
                const task = this.projection.get(event.payload.id);
                if (task) {
                    const updated = { ...task, status: event.payload.status, progress: event.payload.progress };
                    this.projection.set(updated.id, updated);
                    this.crdt.add(updated, event.ts);
                    this.history.snapshot(updated);
                }
            }
        }

        query() {
            return Array.from(this.projection.values());
        }
    }

    class AnalyticsEngine {
        static burndown(tasks) {
            const total = tasks.length || 1;
            const done = tasks.filter(tk => tk.status === 'done').length;
            return Math.round((done / total) * 100);
        }

        static forecast(tasks) {
            const remaining = tasks.filter(tk => tk.status !== 'done');
            const avg = remaining.reduce((acc, task) => acc + task.estimatedMinutes, 0) / (remaining.length || 1);
            return Math.max(1, Math.round(avg / 60));
        }

        static heatmap(tasks) {
            const grid = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
            tasks.forEach(task => {
                const date = new Date(task.createdAt);
                grid[date.getDay()][date.getHours()] += 1;
            });
            return grid;
        }
    }

    class AdaptiveClassifier {
        constructor() {
            this.weights = new CustomHashMap();
        }

        train(label, text) {
            const tokens = text.toLowerCase().split(/\s+/g);
            tokens.forEach(token => {
                const key = `${label}:${token}`;
                this.weights.set(key, (this.weights.get(key) || 0) + 1);
            });
        }

        predict(text, labels) {
            const tokens = text.toLowerCase().split(/\s+/g);
            let best = labels[0];
            let bestScore = -Infinity;
            labels.forEach(label => {
                let score = 0;
                tokens.forEach(token => {
                    score += this.weights.get(`${label}:${token}`) || 0;
                });
                if (score > bestScore) {
                    bestScore = score;
                    best = label;
                }
            });
            return best;
        }
    }

    class ReminderEngine {
        constructor() {
            this.lastMood = 'calm';
        }

        context(task) {
            const hour = new Date().getHours();
            const device = task.deviceContext;
            const location = task.locationHint;
            const mood = this.lastMood;
            return { hour, device, location, mood };
        }

        shouldNotify(task) {
            const { hour, mood } = this.context(task);
            return hour >= 9 && hour <= 20 && mood !== 'stressed';
        }
    }

    class ScriptEngine {
        execute(input) {
            const tokens = input.trim().split(/\s+/g);
            if (tokens[0] === 'template' && tokens[1] === 'sprint') {
                const size = Number(tokens[2] || 3);
                return Array.from({ length: size }, (_, idx) => TaskFactory.create(`Sprint Task ${idx + 1}`, 6));
            }
            if (tokens[0] === 'repeat') {
                const title = tokens.slice(2).join(' ') || 'Rotina';
                return [TaskFactory.create(`${title} (recorrente)`, 4)];
            }
            return [];
        }
    }

    class BackupManager {
        constructor() {
            this.snapshots = [];
        }

        diff(oldTasks, newTasks) {
            const oldIds = new Set(oldTasks.map(task => task.id));
            const added = newTasks.filter(task => !oldIds.has(task.id));
            return { added };
        }

        compress(payload) {
            const raw = JSON.stringify(payload);
            let output = '';
            let count = 1;
            for (let i = 1; i <= raw.length; i += 1) {
                if (raw[i] === raw[i - 1]) {
                    count += 1;
                } else {
                    output += `${raw[i - 1]}${count}`;
                    count = 1;
                }
            }
            return output;
        }

        snapshot(tasks) {
            const previous = this.snapshots[this.snapshots.length - 1]?.tasks || [];
            const diff = this.diff(previous, tasks);
            this.snapshots.push({ ts: Date.now(), tasks, delta: this.compress(diff) });
        }
    }

    class VirtualScroller {
        constructor(container, styles, rowHeight = 28) {
            this.container = container;
            this.styles = styles;
            this.rowHeight = rowHeight;
            this.items = [];
            this.viewport = document.createElement('div');
            this.viewport.className = 'virtual-viewport';
            this.container.innerHTML = '';
            this.container.appendChild(this.viewport);
            this.container.addEventListener('scroll', () => this.render());
        }

        setItems(items) {
            this.items = items;
            this.styles.setRule('virtual-viewport', `.virtual-viewport{height:${items.length * this.rowHeight}px;}`);
            this.render();
        }

        render() {
            const scrollTop = this.container.scrollTop;
            const height = this.container.clientHeight;
            const start = Math.floor(scrollTop / this.rowHeight);
            const end = Math.min(this.items.length, start + Math.ceil(height / this.rowHeight) + 5);
            this.viewport.innerHTML = '';
            for (let i = start; i < end; i += 1) {
                const item = this.items[i];
                const row = document.createElement('div');
                const className = `virtual-item virtual-item-${i}`;
                row.className = className;
                this.styles.setRule(`virtual-${i}`, `.virtual-item-${i}{top:${i * this.rowHeight}px;}`);
                row.textContent = `${item.title} • ${item.status}`;
                this.viewport.appendChild(row);
            }
        }
    }

    class AdvancedApp {
        constructor() {
            this.store = new StateStore();
            this.cache = new ARCCache(100);
            this.db = new TaskDB();
            this.dynamicStyles = new DynamicStyles();
            this.priorityEngine = new PriorityEngine([
                new EisenhowerStrategy(),
                new ParetoStrategy(),
                new CustomStrategy()
            ]);
            this.queue = new PriorityQueue();
            this.categoryTree = new NaryTree({ id: 'root', label: 'Raiz' });
            this.scheduler = new RoundRobinScheduler(20);
            this.worker = window.Worker ? new Worker('/advanced-worker.js') : null;
            this.plugins = new PluginKernel();
            this.di = new DIContainer();
            this.classifier = new AdaptiveClassifier();
            this.reminders = new ReminderEngine();
            this.scriptEngine = new ScriptEngine();
            this.backup = new BackupManager();
            this.virtualScroller = null;
            this.bindEvents();
        }

        async init() {
            await this.db.open();
            this.plugins.use({
                activate: (ctx) => {
                    ctx.bus.on('TASK_CREATED', () => log('plugin.audit', { module: 'audit' }));
                }
            });
            this.plugins.activate({ bus: this.store.bus });
            this.di.register('crypto', () => new CryptoVault());
            this.virtualScroller = new VirtualScroller($('#virtualList'), this.dynamicStyles);
            this.seedCategories();
            this.render();
            log('advanced.ready');
        }

        seedCategories() {
            const work = new NaryTreeNode({ id: 'work', label: 'Trabalho' });
            const home = new NaryTreeNode({ id: 'home', label: 'Casa' });
            const growth = new NaryTreeNode({ id: 'growth', label: 'Crescimento' });
            this.categoryTree.root.addChild(work);
            this.categoryTree.root.addChild(home);
            this.categoryTree.root.addChild(growth);
            this.classifier.train('work', 'reuniao projeto entrega cliente');
            this.classifier.train('home', 'mercado limpeza casa familia');
            this.classifier.train('growth', 'estudar curso leitura prática');
        }

        bindEvents() {
            $('#seedTasks')?.addEventListener('click', () => this.seed());
            $('#advancedAdd')?.addEventListener('click', () => this.addFromForm());
            $('#runAnalytics')?.addEventListener('click', () => this.analyze());
            $('#runScript')?.addEventListener('click', () => this.runScript());
            $('#searchInput')?.addEventListener('input', (event) => this.search(event.target.value));
            $$('#advancedApp [data-view]').forEach(btn => {
                btn.addEventListener('click', () => this.switchView(btn.dataset.view));
            });
            $('#themeSelect')?.addEventListener('change', (event) => this.applyTheme(event.target.value));
        }

        applyTheme(theme) {
            document.documentElement.dataset.theme = theme;
        }

        seed() {
            for (let i = 0; i < 8; i += 1) {
                const task = TaskFactory.create(`Projeto ${i + 1}`, 3 + (i % 5), toIso(now()));
                task.categoryId = this.classifier.predict(task.title, ['work', 'home', 'growth']);
                this.store.dispatch({ type: 'CREATE_TASK', payload: task });
                this.queue.enqueue(task, this.priorityEngine.score(task));
                this.cache.set(task.id, task);
            }
            this.persist();
            this.render();
            log('seeded');
        }

        addFromForm() {
            const title = $('#advancedTitleInput')?.value?.trim();
            const energy = Number($('#advancedEnergy')?.value || 5);
            const dueAt = $('#advancedDeadline')?.value;
            if (!title) return;
            const task = TaskFactory.create(title, energy, dueAt ? toIso(new Date(dueAt)) : null);
            task.categoryId = this.classifier.predict(task.title, ['work', 'home', 'growth']);
            this.store.dispatch({ type: 'CREATE_TASK', payload: task });
            this.queue.enqueue(task, this.priorityEngine.score(task));
            this.cache.set(task.id, task);
            this.persist();
            this.render();
            $('#advancedTitleInput').value = '';
            log('task.added', { id: task.id, title });
        }

        async persist() {
            const tasks = this.store.query();
            this.db.buildFullTextIndex(tasks);
            for (const task of tasks) {
                await this.db.put(task);
            }
            this.backup.snapshot(tasks);
        }

        analyze() {
            const tasks = this.store.query();
            if (this.worker) {
                this.worker.postMessage({ type: 'ANALYZE', payload: { tasks } });
                this.worker.onmessage = (event) => {
                    const { criticalPath, heatmap } = event.data.payload;
                    this.updateAnalytics(tasks, criticalPath, heatmap);
                };
            } else {
                const criticalPath = CriticalPathEngine.calculate(tasks);
                const heatmap = AnalyticsEngine.heatmap(tasks);
                this.updateAnalytics(tasks, criticalPath, heatmap);
            }
        }

        updateAnalytics(tasks, criticalPath, heatmap) {
            const burndown = AnalyticsEngine.burndown(tasks);
            const forecast = AnalyticsEngine.forecast(tasks);
            this.dynamicStyles.setRule('burndown', `.burndown-bar{width:${burndown}%;}`);
            $('#forecastText').textContent = `${t('forecast')}: ${forecast}h`;
            $('#heatmapPreview').textContent = `Picos: ${Math.max(...heatmap.flat())}`;
            $('#stateSummary').textContent = `${tasks.length} ${t('tasks')} • CP ${criticalPath}m`;
            log('analytics.ready', { criticalPath, burndown });
        }

        render() {
            const tasks = this.store.query();
            this.renderKanban(tasks);
            this.renderGantt(tasks);
            this.renderMindMap(tasks);
            this.renderCalendar(tasks);
            this.renderPriority(tasks);
            this.renderVirtualList(tasks);
            tasks.slice(0, 3).forEach(task => {
                if (this.reminders.shouldNotify(task)) {
                    log('reminder.ready', { id: task.id, context: this.reminders.context(task) });
                }
            });
        }

        renderKanban(tasks) {
            const columns = {
                todo: $('#kanbanTodo'),
                doing: $('#kanbanDoing'),
                done: $('#kanbanDone')
            };
            Object.values(columns).forEach(col => { if (col) col.innerHTML = ''; });
            tasks.forEach(task => {
                const card = document.createElement('div');
                card.className = 'kanban-card';
                card.textContent = `${task.title} • ${task.energy}`;
                columns[task.status]?.appendChild(card);
            });
        }

        renderGantt(tasks) {
            const timeline = $('#ganttTimeline');
            if (!timeline) return;
            timeline.innerHTML = '';
            const schedule = this.scheduler.schedule(tasks);
            schedule.forEach(slot => {
                const row = document.createElement('div');
                row.className = 'gantt-row';
                const barClass = `gantt-bar gantt-bar-${slot.id.replace(/[^a-zA-Z0-9_-]/g, '')}`;
                this.dynamicStyles.setRule(
                    `gantt-${slot.id}`,
                    `.gantt-bar-${slot.id.replace(/[^a-zA-Z0-9_-]/g, '')}{width:${Math.max(10, slot.end)}px;}`
                );
                row.innerHTML = `<span>${slot.id}</span><div class="${barClass}"></div>`;
                timeline.appendChild(row);
            });
        }

        renderMindMap(tasks) {
            const container = $('#mindMap');
            if (!container) return;
            container.innerHTML = '';
            const center = { x: 120, y: 80 };
            tasks.slice(0, 6).forEach((task, index) => {
                const node = document.createElement('div');
                const className = `mindmap-node mindmap-node-${index}`;
                node.className = className;
                const left = center.x + 80 * Math.cos(index);
                const top = center.y + 50 * Math.sin(index);
                this.dynamicStyles.setRule(
                    `mindmap-${index}`,
                    `.mindmap-node-${index}{left:${left}px;top:${top}px;}`
                );
                node.textContent = task.title;
                container.appendChild(node);
            });
        }

        renderCalendar(tasks) {
            const grid = $('#calendarGrid');
            if (!grid) return;
            grid.innerHTML = '';
            for (let i = 0; i < 7; i += 1) {
                const cell = document.createElement('div');
                cell.className = 'calendar-cell';
                const dayTasks = tasks.filter(task => new Date(task.createdAt).getDay() === i);
                cell.innerHTML = `<strong>${i + 1}</strong><br>${dayTasks.length} tarefas`;
                grid.appendChild(cell);
            }
        }

        renderPriority(tasks) {
            const matrix = this.priorityEngine.classify(tasks);
            const preview = $('#priorityPreview');
            if (!preview) return;
            let count = 0;
            for (let u = 0; u < matrix.length; u += 1) {
                for (let i = 0; i < matrix[u].length; i += 1) {
                    for (let e = 0; e < matrix[u][i].length; e += 1) {
                        for (let c = 0; c < matrix[u][i][e].length; c += 1) {
                            count += matrix[u][i][e][c].length;
                        }
                    }
                }
            }
            preview.textContent = `${count} tarefas distribuídas na matriz 4D.`;
        }

        renderVirtualList(tasks) {
            if (!this.virtualScroller) return;
            this.virtualScroller.setItems(tasks);
        }

        search(query) {
            const tasks = this.store.query();
            if (!query) {
                this.renderVirtualList(tasks);
                return;
            }
            const ids = this.db.search(query);
            const filtered = tasks.filter(task => ids.includes(task.id));
            this.renderVirtualList(filtered);
        }

        runScript() {
            const input = $('#scriptInput')?.value || '';
            const tasks = this.scriptEngine.execute(input);
            tasks.forEach(task => {
                this.store.dispatch({ type: 'CREATE_TASK', payload: task });
                this.queue.enqueue(task, this.priorityEngine.score(task));
            });
            this.persist();
            this.render();
            $('#scriptInput').value = '';
            log('script.executed', { tasks: tasks.length });
        }

        switchView(view) {
            $$('.advanced-view').forEach(section => section.classList.remove('active'));
            const target = $(`#view-${view}`);
            if (target) target.classList.add('active');
            $$('#advancedApp [data-view]').forEach(btn => {
                btn.setAttribute('aria-selected', btn.dataset.view === view ? 'true' : 'false');
            });
        }
    }

    const app = new AdvancedApp();
    app.init();
})();
