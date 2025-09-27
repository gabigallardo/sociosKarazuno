// src/layouts/Layout.jsx
import Navigation from "../components/navigation.jsx";

export default function Layout({ children }) {
  return (
    <div className="flex">
      <Navigation />

      <div className="ml-64 flex-1 min-h-screen flex flex-col">
        <header className="bg-white p-6 border-b">
          <h1 className="text-2xl font-bold">Hola, Gabriel</h1>
        </header>

        <main className="flex-1 p-6 bg-gray-50">{children}</main>

        <footer className="bg-red-700 text-white text-center p-4">
          footer
        </footer>
      </div>
    </div>
  );
}
