"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Todo = {
  id: string;
  title: string;
  details: string;
  importance: number;
  urgency: number;
  done: boolean;
};

const zh = (value: string) =>
  value.replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)));

const C = {
  heading: zh("&#25226;&#27599;&#20214;&#20107;&#25918;&#22312;&#37325;&#35201;&#24230;&#33287;&#24613;&#36843;&#24230;&#30340;&#22320;&#22294;"),
  newTodo: zh("&#26032;&#22686;&#24453;&#36774;&#20107;&#38917;"),
  map: zh("&#20778;&#20808;&#38918;&#24207;&#24231;&#27161;"),
  lessImportant: zh("&#19981;&#37325;&#35201;"),
  veryImportant: zh("&#24456;&#37325;&#35201;"),
  veryUrgent: zh("&#38750;&#24120;&#36245;&#26178;&#38291;"),
  notUrgent: zh("&#19981;&#36245;&#26178;&#38291;"),
  urgentLessImportant: zh("&#24613;&#20294;&#36611;&#19981;&#37325;&#35201;"),
  doFirst: zh("&#39340;&#19978;&#34389;&#29702;"),
  parkIt: zh("&#20808;&#25918;&#33879;"),
  scheduleDeepWork: zh("&#25490;&#31243;&#28145;&#20570;"),
  doNow: zh("&#29694;&#22312;&#20808;&#20570;"),
  sortedBy: zh("&#20381;&#37325;&#35201;&#24230; + &#24613;&#36843;&#24230;&#25490;&#24207;"),
  reset: zh("&#37325;&#35373;"),
  importance: zh("&#37325;&#35201;"),
  urgency: zh("&#24613;&#36843;"),
  done: zh("&#23436;&#25104;"),
  details: zh("&#32048;&#31680;"),
  expand: zh("&#23637;&#38283;"),
  collapse: zh("&#25910;&#21512;"),
  detailPlaceholder: zh("&#20633;&#35387;&#12289;&#24819;&#27861;&#12289;&#19979;&#19968;&#27493;"),
  completed: zh("&#24050;&#23436;&#25104;"),
  showCompleted: zh("&#39023;&#31034;&#24050;&#23436;&#25104;"),
  hideCompleted: zh("&#38577;&#34255;&#24050;&#23436;&#25104;"),
  completedItems: zh("&#24050;&#23436;&#25104;&#20107;&#38917;"),
  noCompleted: zh("&#36996;&#27794;&#26377;&#23436;&#25104;&#30340;&#20107;&#38917;"),
  idle: zh("&#25302;&#21205;&#27873;&#27873;&#21363;&#21487;&#25913;&#35722;&#25490;&#24207;&#65307;&#36039;&#26009;&#26371;&#20808;&#23384;&#22312;&#36889;&#21488;&#35037;&#32622;&#12290;"),
  adjusting: zh("&#27491;&#22312;&#35519;&#25972;"),
  todoList: zh("&#24453;&#36774;&#28165;&#21934;"),
  doneHint: zh("&#23436;&#25104;&#24460;&#26371;&#24478;&#22320;&#22294;&#31227;&#21040;&#24050;&#23436;&#25104;&#21312;&#12290;"),
  empty: zh("&#27794;&#26377;&#24453;&#36774;&#20107;&#38917;&#65292;&#26032;&#22686;&#19968;&#20214;&#38283;&#22987;&#25490;&#20301;&#32622;&#12290;"),
};

const starterTodos: Todo[] = [
  {
    id: "launch-plan",
    title: zh("&#25972;&#29702;&#29986;&#21697;&#31532;&#19968;&#29256;&#31684;&#22285;"),
    details: "MVP: drag bubbles, ranked list, local save, later Supabase sync.",
    importance: 82,
    urgency: 76,
    done: false,
  },
  {
    id: "doctor",
    title: zh("&#38928;&#32004;&#20581;&#24247;&#27298;&#26597;"),
    details: "",
    importance: 66,
    urgency: 42,
    done: false,
  },
  {
    id: "invoice",
    title: zh("&#34389;&#29702;&#26412;&#26376;&#30332;&#31080;"),
    details: "",
    importance: 48,
    urgency: 85,
    done: false,
  },
  {
    id: "reading",
    title: zh("&#38321;&#35712; Supabase &#35373;&#23450;&#31558;&#35352;"),
    details: "",
    importance: 36,
    urgency: 28,
    done: false,
  },
];

const clamp = (value: number) => Math.min(100, Math.max(0, Math.round(value)));
const scoreTodo = (todo: Todo) => todo.importance + todo.urgency;

function normalizeTodo(todo: Partial<Todo>): Todo | null {
  if (!todo.id || !todo.title) return null;

  return {
    id: todo.id,
    title: todo.title,
    details: typeof todo.details === "string" ? todo.details : "",
    importance: clamp(Number(todo.importance ?? 50)),
    urgency: clamp(Number(todo.urgency ?? 50)),
    done: Boolean(todo.done),
  };
}

export default function Home() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [todos, setTodos] = useState<Todo[]>(starterTodos);
  const [title, setTitle] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(starterTodos[0]?.id ?? null);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("bubble-todos");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<Todo>[];
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeTodo).filter((todo): todo is Todo => Boolean(todo));
        if (normalized.length > 0) setTodos(normalized);
      }
    } catch {
      window.localStorage.removeItem("bubble-todos");
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("bubble-todos", JSON.stringify(todos));
  }, [todos]);

  const activeTodos = useMemo(() => todos.filter((todo) => !todo.done), [todos]);
  const completedTodos = useMemo(() => todos.filter((todo) => todo.done), [todos]);
  const rankedTodos = useMemo(
    () => [...activeTodos].sort((a, b) => scoreTodo(b) - scoreTodo(a)),
    [activeTodos],
  );

  const activeTodo = todos.find((todo) => todo.id === draggingId);

  function updateTodo(id: string, patch: Partial<Todo>) {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, ...patch } : todo)));
  }

  function placeTodo(clientX: number, clientY: number, id: string) {
    const board = boardRef.current;
    if (!board) return;

    const rect = board.getBoundingClientRect();
    const importance = clamp(((clientX - rect.left) / rect.width) * 100);
    const urgency = clamp(100 - ((clientY - rect.top) / rect.height) * 100);
    updateTodo(id, { importance, urgency });
  }

  function addTodo() {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newTodo = {
      id: crypto.randomUUID(),
      title: cleanTitle,
      details: "",
      importance: 50,
      urgency: 50,
      done: false,
    };

    setTodos((current) => [...current, newTodo]);
    setExpandedId(newTodo.id);
    setTitle("");
  }

  function resetDemo() {
    setTodos(starterTodos);
    setExpandedId(starterTodos[0]?.id ?? null);
    setShowCompleted(false);
  }

  function toggleDone(todo: Todo, done: boolean) {
    updateTodo(todo.id, { done });
    setDraggingId(null);
    if (done) setExpandedId(null);
  }

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-[#1b1f24]">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d9d3c8] pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#0f766e]">Bubble Priority Todo</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#191b1f] sm:text-4xl">{C.heading}</h1>
          </div>
          <form
            className="flex w-full gap-2 md:max-w-md"
            onSubmit={(event) => {
              event.preventDefault();
              addTodo();
            }}
          >
            <input
              aria-label={C.newTodo}
              className="min-w-0 flex-1 border border-[#bdb6aa] bg-white px-3 py-3 text-base outline-none transition focus:border-[#0f766e] focus:ring-2 focus:ring-[#99f6e4]"
              placeholder={C.newTodo}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
            <button className="shrink-0 bg-[#1b1f24] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#30363d]">
              {C.newTodo}
            </button>
          </form>
        </header>

        <div className="grid flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_420px]">
          <section className="flex min-h-[520px] flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{C.map}</h2>
              <div className="flex items-center gap-2 text-xs text-[#59616b]">
                <span>{C.lessImportant}</span>
                <span className="h-px w-10 bg-[#a8a198]" />
                <span>{C.veryImportant}</span>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-[22px_minmax(0,1fr)] gap-2">
              <div className="flex flex-col items-center justify-between py-6 text-xs text-[#59616b]">
                <span className="[writing-mode:vertical-rl]">{C.veryUrgent}</span>
                <span className="[writing-mode:vertical-rl]">{C.notUrgent}</span>
              </div>

              <div
                ref={boardRef}
                className="priority-board relative min-h-[500px] overflow-hidden border border-[#bdb6aa] bg-white shadow-sm touch-none"
                onPointerMove={(event) => {
                  if (!draggingId) return;
                  placeTodo(event.clientX, event.clientY, draggingId);
                }}
                onPointerUp={() => setDraggingId(null)}
                onPointerCancel={() => setDraggingId(null)}
              >
                <div className="axis-label top-3 left-3">{C.urgentLessImportant}</div>
                <div className="axis-label top-3 right-3">{C.doFirst}</div>
                <div className="axis-label bottom-3 left-3">{C.parkIt}</div>
                <div className="axis-label right-3 bottom-3">{C.scheduleDeepWork}</div>

                {activeTodos.map((todo) => (
                  <button
                    key={todo.id}
                    className={`todo-bubble ${draggingId === todo.id ? "is-dragging" : ""}`}
                    style={{
                      left: `${todo.importance}%`,
                      top: `${100 - todo.urgency}%`,
                    }}
                    onPointerDown={(event) => {
                      event.currentTarget.setPointerCapture(event.pointerId);
                      setDraggingId(todo.id);
                      placeTodo(event.clientX, event.clientY, todo.id);
                    }}
                    aria-label={`${todo.title}, ${C.importance} ${todo.importance}, ${C.urgency} ${todo.urgency}`}
                  >
                    <span>{todo.title}</span>
                    <small>{scoreTodo(todo)}</small>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="flex flex-col border border-[#cfc7bb] bg-[#fffcf5]">
            <div className="flex items-center justify-between gap-3 border-b border-[#d9d3c8] px-4 py-3">
              <div>
                <h2 className="text-lg font-semibold">{C.doNow}</h2>
                <p className="text-sm text-[#59616b]">{C.sortedBy}</p>
              </div>
              <button
                className="border border-[#bdb6aa] bg-white px-3 py-2 text-sm font-semibold text-[#1b1f24] transition hover:border-[#0f766e]"
                onClick={resetDemo}
              >
                {C.reset}
              </button>
            </div>

            <div className="flex-1 overflow-auto">
              {rankedTodos.length === 0 ? <p className="empty-state">{C.empty}</p> : null}
              {rankedTodos.map((todo, index) => {
                const expanded = expandedId === todo.id;

                return (
                  <article className="todo-row" key={todo.id}>
                    <div className="todo-row-main">
                      <div className="rank">{index + 1}</div>
                      <div className="min-w-0 flex-1">
                        <h3>{todo.title}</h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-[#59616b]">
                          <span>
                            {C.importance} {todo.importance}
                          </span>
                          <span>
                            {C.urgency} {todo.urgency}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <strong>{scoreTodo(todo)}</strong>
                        <button
                          className="small-button"
                          onClick={() => setExpandedId(expanded ? null : todo.id)}
                          type="button"
                        >
                          {expanded ? C.collapse : C.expand}
                        </button>
                      </div>
                    </div>

                    {expanded ? (
                      <div className="todo-details">
                        <label>
                          <span>{C.details}</span>
                          <textarea
                            placeholder={C.detailPlaceholder}
                            value={todo.details}
                            onChange={(event) => updateTodo(todo.id, { details: event.target.value })}
                          />
                        </label>
                        <label className="done-toggle">
                          <input type="checkbox" checked={todo.done} onChange={(event) => toggleDone(todo, event.target.checked)} />
                          {C.done}
                        </label>
                        <p>{C.doneHint}</p>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>

            <div className="completed-panel">
              <button className="completed-toggle" type="button" onClick={() => setShowCompleted((value) => !value)}>
                {showCompleted ? C.hideCompleted : C.showCompleted} ({completedTodos.length})
              </button>

              {showCompleted ? (
                <div className="completed-list">
                  <h3>{C.completedItems}</h3>
                  {completedTodos.length === 0 ? <p>{C.noCompleted}</p> : null}
                  {completedTodos.map((todo) => (
                    <article className="completed-item" key={todo.id}>
                      <div>
                        <strong>{todo.title}</strong>
                        {todo.details ? <p>{todo.details}</p> : null}
                      </div>
                      <label className="done-toggle">
                        <input type="checkbox" checked={todo.done} onChange={(event) => toggleDone(todo, event.target.checked)} />
                        {C.done}
                      </label>
                    </article>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border-t border-[#d9d3c8] px-4 py-3 text-sm text-[#59616b]">
              {activeTodo
                ? `${C.adjusting}: ${activeTodo.title}, ${C.importance} ${activeTodo.importance}, ${C.urgency} ${activeTodo.urgency}`
                : C.idle}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
