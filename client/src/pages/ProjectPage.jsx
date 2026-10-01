import { useEffect, useState } from 'react';
import {
    Plus,
    Trash2,
    CheckCircle2,
    Circle,
} from 'lucide-react';

import { api } from '../services/api';

import {
    Button,
    Modal,
    Field,
    Textarea,
    Select,
    SearchBox,
    Empty,
    Confirm,
    Spinner,
    toast,
} from '../components/ui';

export default function ProjectPage() {
    const [ps, setPs] = useState([]);
    const [q, setQ] = useState('');
    const [sel, setSel] = useState(null);
    const [open, setOpen] = useState(false);
    const [del, setDel] = useState(null);

    const load = () => {
        return api
            .get('/projects', {
                params: q ? { q } : undefined,
            })
            .then((r) => {
                setPs(r.data);
            })
            .catch((e) => {
                toast.error(
                    e.response?.data?.message || 'Load failed'
                );
            });
    };

    useEffect(() => {
        load();
    }, [q]);

    const create = async (f) => {
        try {
            await api.post('/projects', f);

            toast.success('Project created');

            setOpen(false);

            load();
        } catch (e) {
            toast.error(
                e.response?.data?.message || 'Save failed'
            );
        }
    };

    const remove = async () => {
        if (!del) return;

        try {
            await api.delete('/projects/' + del._id);

            toast.success('Deleted');

            setDel(null);

            if (sel?._id === del._id) {
                setSel(null);
            }

            load();
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    return (
        <>
            <div className="page-head">
                <div>
                    <span className="eyebrow">COLLABORATION</span>

                    <h1>TeamMate</h1>

                    <p>
                        Manage projects, tasks and team progress.
                    </p>
                </div>

                <Button onClick={() => setOpen(true)}>
                    <Plus size={17} />
                    New project
                </Button>
            </div>

            <div className="toolbar">
                <SearchBox
                    value={q}
                    onChange={setQ}
                />
            </div>

            {!ps.length ? (
                <Empty
                    title="No projects yet"
                    text="Create a project and start tracking tasks."
                />
            ) : (
                <div className="project-list">
                    {ps.map((p) => (
                        <div
                            className="project-row"
                            key={p._id}
                            onClick={() => setSel(p)}
                        >
                            <div className="project-mark">
                                {p.name?.[0] || 'P'}
                            </div>

                            <div className="project-info">
                                <h3>{p.name}</h3>

                                <p>
                                    {p.description || 'No description'}
                                </p>
                            </div>

                            <span className="badge">
                                {p.status}
                            </span>

                            <button
                                className="icon-btn danger-icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDel(p);
                                }}
                            >
                                <Trash2 size={17} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title="Create project"
            >
                <ProjectForm onSave={create} />
            </Modal>

            <Confirm
                open={!!del}
                onClose={() => setDel(null)}
                onConfirm={remove}
            />

            {sel && (
                <ProjectDetail
                    p={sel}
                    onClose={() => setSel(null)}
                />
            )}
        </>
    );
}

function ProjectForm({ onSave }) {
    const [f, setF] = useState({
        name: '',
        description: '',
        startDate: '',
        deadline: '',
        status: 'Planning',
    });

    const update = (key, value) => {
        setF((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        onSave(f);
    };

    return (
        <form onSubmit={submit}>
            <Field
                label="Project name"
                required
                value={f.name}
                onChange={(e) =>
                    update('name', e.target.value)
                }
            />

            <Textarea
                label="Description"
                value={f.description}
                onChange={(e) =>
                    update('description', e.target.value)
                }
            />

            <div className="two">
                <Field
                    label="Start date"
                    type="date"
                    value={f.startDate}
                    onChange={(e) =>
                        update('startDate', e.target.value)
                    }
                />

                <Field
                    label="Deadline"
                    type="date"
                    value={f.deadline}
                    onChange={(e) =>
                        update('deadline', e.target.value)
                    }
                />
            </div>

            <Select
                label="Status"
                value={f.status}
                onChange={(e) =>
                    update('status', e.target.value)
                }
            >
                {[
                    'Planning',
                    'Active',
                    'On Hold',
                    'Completed',
                ].map((x) => (
                    <option key={x} value={x}>
                        {x}
                    </option>
                ))}
            </Select>

            <Button className="full">
                Create project
            </Button>
        </form>
    );
}

function ProjectDetail({ p, onClose }) {
    const [d, setD] = useState(null);

    const [task, setTask] = useState({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do',
    });

    const load = () => {
        return api
            .get('/projects/' + p._id)
            .then((r) => {
                setD(r.data);
            })
            .catch(() => { });
    };

    useEffect(() => {
        load();
    }, [p._id]);

    const add = async (e) => {
        e.preventDefault();

        try {
            await api.post(
                '/projects/' + p._id + '/tasks',
                task
            );

            setTask({
                title: '',
                description: '',
                priority: 'Medium',
                status: 'To Do',
            });

            toast.success('Task added');

            load();
        } catch (e) {
            toast.error(
                e.response?.data?.message || 'Task failed'
            );
        }
    };

    const update = async (t, patch) => {
        try {
            await api.put('/tasks/' + t._id, patch);

            load();
        } catch (e) {
            toast.error('Task update failed');
        }
    };

    const removeTask = async (taskId) => {
        try {
            await api.delete('/tasks/' + taskId);

            load();
        } catch (e) {
            toast.error('Task delete failed');
        }
    };

    return (
        <Modal
            open={true}
            onClose={onClose}
            title={p.name}
        >
            {!d ? (
                <Spinner />
            ) : (
                <>
                    <p className="muted">
                        {d.description || 'No description'}
                    </p>

                    <div className="task-list">
                        {d.tasks?.map((t) => (
                            <div
                                className="task-row"
                                key={t._id}
                            >
                                <button
                                    className="check"
                                    onClick={() =>
                                        update(t, {
                                            status:
                                                t.status === 'Completed'
                                                    ? 'To Do'
                                                    : 'Completed',
                                        })
                                    }
                                >
                                    {t.status === 'Completed' ? (
                                        <CheckCircle2 />
                                    ) : (
                                        <Circle />
                                    )}
                                </button>

                                <div>
                                    <b
                                        className={
                                            t.status === 'Completed'
                                                ? 'done'
                                                : ''
                                        }
                                    >
                                        {t.title}
                                    </b>

                                    <small>
                                        {t.priority} · {t.status}
                                    </small>
                                </div>

                                <button
                                    className="icon-btn danger-icon"
                                    onClick={() =>
                                        removeTask(t._id)
                                    }
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form
                        onSubmit={add}
                        className="task-form"
                    >
                        <Field
                            label="Task title"
                            required
                            value={task.title}
                            onChange={(e) =>
                                setTask((prev) => ({
                                    ...prev,
                                    title: e.target.value,
                                }))
                            }
                        />

                        <Textarea
                            label="Description"
                            value={task.description}
                            onChange={(e) =>
                                setTask((prev) => ({
                                    ...prev,
                                    description: e.target.value,
                                }))
                            }
                        />

                        <div className="two">
                            <Select
                                label="Priority"
                                value={task.priority}
                                onChange={(e) =>
                                    setTask((prev) => ({
                                        ...prev,
                                        priority: e.target.value,
                                    }))
                                }
                            >
                                {['Low', 'Medium', 'High'].map(
                                    (x) => (
                                        <option
                                            key={x}
                                            value={x}
                                        >
                                            {x}
                                        </option>
                                    )
                                )}
                            </Select>

                            <Select
                                label="Status"
                                value={task.status}
                                onChange={(e) =>
                                    setTask((prev) => ({
                                        ...prev,
                                        status: e.target.value,
                                    }))
                                }
                            >
                                {[
                                    'To Do',
                                    'In Progress',
                                    'Completed',
                                ].map((x) => (
                                    <option
                                        key={x}
                                        value={x}
                                    >
                                        {x}
                                    </option>
                                ))}
                            </Select>
                        </div>

                        <Button className="full">
                            Add task
                        </Button>
                    </form>
                </>
            )}
        </Modal>
    );
}