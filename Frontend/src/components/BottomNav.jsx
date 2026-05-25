export default function BottomNav({ setPage }) {
  return (
    <div className="fixed bottom-0 w-full max-w-md bg-white shadow flex justify-around py-3">
      <button onClick={() => setPage("dashboard")}>🏠</button>
      <button onClick={() => setPage("history")}>📜</button>
      <button
        onClick={() => setPage("add")}
        className="bg-indigo-600 text-white w-12 h-12 rounded-full -mt-6 text-xl"
      >
        +
      </button>
      <button onClick={() => setPage("reports")}>📊</button>
    </div>
  );
}
