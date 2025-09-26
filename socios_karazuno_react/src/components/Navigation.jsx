import { Link } from "react-router-dom";
import React from "react";

export function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/socios">Socios</Link>
        </li>
        <li>
          <Link to="/form">Formulario</Link>
        </li>
      </ul>
    </nav>
  );
}
