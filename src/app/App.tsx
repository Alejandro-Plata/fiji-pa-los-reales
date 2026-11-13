import { createHashRouter, RouterProvider } from 'react-router-dom';
import { Layout } from './Layout';
import { ProveedorRecetetas } from './EstadoRecetetas';
import { ProveedorAvisos } from './Avisos';
import { Inicio } from '../pantallas/Inicio/Inicio';
import { Asistente } from '../pantallas/Asistente/Asistente';
import { Resultado } from '../pantallas/Resultado/Resultado';
import { Instrucciones } from '../pantallas/Instrucciones/Instrucciones';
import { Ajustes } from '../pantallas/Ajustes/Ajustes';
import { Rapido } from '../pantallas/Rapido/Rapido';
import { Importar } from '../pantallas/Importar/Importar';
import { NoEncontrada } from '../pantallas/NoEncontrada/NoEncontrada';

// Router de datos con hash: permite useBlocker (aviso al salir sin guardar)
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'receteta/nueva', element: <Asistente /> },
      { path: 'receteta/nueva/:tipo', element: <Asistente /> },
      { path: 'receteta/:id', element: <Asistente /> },
      { path: 'receteta/:id/macro', element: <Resultado /> },
      { path: 'fiji', element: <Instrucciones /> },
      { path: 'ajustes', element: <Ajustes /> },
      { path: 'rapido', element: <Rapido /> },
      { path: 'importar', element: <Importar /> },
      { path: '*', element: <NoEncontrada /> },
    ],
  },
]);

export function App() {
  return (
    <ProveedorAvisos>
      <ProveedorRecetetas>
        <RouterProvider router={router} />
      </ProveedorRecetetas>
    </ProveedorAvisos>
  );
}
