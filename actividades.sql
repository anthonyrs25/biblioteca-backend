INSERT INTO "Actividad" (nombre, icono, orden, activo) VALUES
  ('Lectura en sala', '📖', 1, true),
  ('Investigación', '🔬', 2, true),
  ('Trabajo académico', '💻', 3, true),
  ('Reunión de trabajo', '👥', 4, true),
  ('Revisión bibliográfica', '📚', 5, true)
ON CONFLICT (nombre) DO NOTHING;