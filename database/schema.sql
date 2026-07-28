CREATE DATABASE IF NOT EXISTS naregua
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE naregua;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  tipo ENUM('cliente', 'barbearia') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE barbearias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  owner_id INT NOT NULL,
  nome_fantasia VARCHAR(100) NOT NULL,
  endereco VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  CONSTRAINT fk_barbearia_owner FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE barbeiros (
  id INT AUTO_INCREMENT PRIMARY KEY,
  barbearia_id INT NOT NULL,
  nome VARCHAR(100) NOT NULL,
  foto_url VARCHAR(255),
  especialidade VARCHAR(100),
  bio TEXT,
  CONSTRAINT fk_barbeiro_barbearia FOREIGN KEY (barbearia_id) REFERENCES barbearias(id)
);

CREATE TABLE agendamentos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  barbeiro_id INT NOT NULL,
  data_hora DATETIME NOT NULL,
  status ENUM('pendente', 'confirmado', 'concluido', 'cancelado') DEFAULT 'pendente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_agendamento_cliente FOREIGN KEY (cliente_id) REFERENCES users(id),
  CONSTRAINT fk_agendamento_barbeiro FOREIGN KEY (barbeiro_id) REFERENCES barbeiros(id),
  CONSTRAINT uq_barbeiro_horario UNIQUE (barbeiro_id, data_hora),
  INDEX idx_agenda_status (barbeiro_id, status, data_hora)
);

-- O contador exibido no perfil sempre nasce dos serviços realmente concluídos:
-- SELECT COUNT(*) FROM agendamentos
-- WHERE barbeiro_id = ? AND status = 'concluido';
