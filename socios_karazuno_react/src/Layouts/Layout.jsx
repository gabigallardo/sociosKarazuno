import Navigation from "../components/Navigation.jsx";
export default function Layout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Navigation />

      {/* Contenido */}
      <div className="ml-64 flex-1 min-h-screen flex flex-col bg-white">
        {/* Header */}
        <header className="p-6 border-b">
          <h1 className="text-3xl font-bold">Hola, Gabriel</h1>
        </header>

        {/* Main */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
