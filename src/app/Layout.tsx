import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { t } from '../textos/es';
import { AvisoAlmacenamiento } from './AvisoAlmacenamiento';
import estilos from './Layout.module.css';

const enlaces = [
  { to: '/', texto: t.nav.inicio, fin: true },
  { to: '/tutorial', texto: t.nav.tutorial, fin: false },
  { to: '/fiji', texto: t.nav.fiji, fin: false },
  { to: '/rapido', texto: t.nav.rapido, fin: false },
  { to: '/ajustes', texto: t.nav.ajustes, fin: false },
];

export function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const { pathname } = useLocation();

  // Al cambiar de pantalla: cerrar el menú y volver arriba
  const [rutaAnterior, setRutaAnterior] = useState(pathname);
  if (rutaAnterior !== pathname) {
    setRutaAnterior(pathname);
    setMenuAbierto(false);
  }
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={estilos.marco}>
      <a className={estilos.saltar} href="#contenido">
        {t.app.saltarAlContenido}
      </a>

      <header className={estilos.cabecera}>
        <div className={`contenedor ${estilos.barraNav}`}>
          <NavLink to="/" className={estilos.marca}>
            <img src="./logo.svg" alt="" width={32} height={32} className={estilos.logo} />
            {t.app.nombre}
          </NavLink>

          <button
            type="button"
            className={estilos.hamburguesa}
            aria-expanded={menuAbierto}
            aria-controls="menu-principal"
            aria-label={menuAbierto ? t.nav.cerrarMenu : t.nav.abrirMenu}
            onClick={() => setMenuAbierto((a) => !a)}
          >
            <span className={estilos.hamburguesaIcono} aria-hidden="true" />
          </button>

          <nav
            id="menu-principal"
            aria-label={t.nav.principal}
            className={estilos.nav}
            data-abierto={menuAbierto}
          >
            <ul className={estilos.listaNav}>
              {enlaces.map((e) => (
                <li key={e.to}>
                  <NavLink
                    to={e.to}
                    end={e.fin}
                    className={({ isActive }) =>
                      `${estilos.enlaceNav} ${isActive ? estilos.enlaceNavActivo : ''}`
                    }
                  >
                    {e.texto}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <AvisoAlmacenamiento />

      <main id="contenido" className={estilos.principal} tabIndex={-1}>
        <Outlet />
      </main>

      <footer className={estilos.pie}>
        <svg
          className={estilos.garabato}
          viewBox="0 0 1200 16"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M0 8 Q 25 0 50 8 T 100 8 T 150 8 T 200 8 T 250 8 T 300 8 T 350 8 T 400 8 T 450 8 T 500 8 T 550 8 T 600 8 T 650 8 T 700 8 T 750 8 T 800 8 T 850 8 T 900 8 T 950 8 T 1000 8 T 1050 8 T 1100 8 T 1150 8 T 1200 8"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className={`contenedor ${estilos.pieContenido}`}>
          <p>
            {t.app.nombre} · {t.app.version(__VERSION_APP__)}
          </p>
        </div>
      </footer>
    </div>
  );
}
