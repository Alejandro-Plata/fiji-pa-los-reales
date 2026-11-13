import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './Layout';
import { Inicio } from '../pantallas/Inicio/Inicio';
import { Asistente } from '../pantallas/Asistente/Asistente';
import { Resultado } from '../pantallas/Resultado/Resultado';
import { Instrucciones } from '../pantallas/Instrucciones/Instrucciones';
import { Ajustes } from '../pantallas/Ajustes/Ajustes';
import { Rapido } from '../pantallas/Rapido/Rapido';
import { Importar } from '../pantallas/Importar/Importar';
import { NoEncontrada } from '../pantallas/NoEncontrada/NoEncontrada';

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Inicio />} />
          <Route path="receteta/nueva" element={<Asistente />} />
          <Route path="receteta/nueva/:tipo" element={<Asistente />} />
          <Route path="receteta/:id" element={<Asistente />} />
          <Route path="receteta/:id/macro" element={<Resultado />} />
          <Route path="fiji" element={<Instrucciones />} />
          <Route path="ajustes" element={<Ajustes />} />
          <Route path="rapido" element={<Rapido />} />
          <Route path="importar" element={<Importar />} />
          <Route path="*" element={<NoEncontrada />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
