USE naregua;

INSERT INTO users (nome, email, senha, tipo) VALUES
('Lucas Almeida', 'lucas@exemplo.com', '$2b$10$hashdemonstrativo', 'cliente'),
('Marcos Oliveira', 'marcos@barbearia85.com', '$2b$10$hashdemonstrativo', 'barbearia');

INSERT INTO barbearias (owner_id, nome_fantasia, endereco, latitude, longitude) VALUES
(2, 'Barbearia 85', 'Rua Silva Paulet, 1480 - Aldeota', -3.73520000, -38.50540000);

INSERT INTO barbeiros (barbearia_id, nome, foto_url, especialidade, bio) VALUES
(1, 'Rafael Lima', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033', 'Degradê & freestyle', 'Especialista em acabamento e desenho livre.'),
(1, 'Caio Mendes', 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a', 'Barba clássica', 'Barboterapia e cortes clássicos.');

INSERT INTO agendamentos (cliente_id, barbeiro_id, data_hora, status) VALUES
(1, 1, '2026-07-29 10:30:00', 'confirmado');
