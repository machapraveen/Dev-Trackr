/*
  # Complete Database Schema Setup

  1. Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - created_at (timestamp)
    
    - projects
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - name (text)
      - description (text)
      - progress (integer)
      - color (text)
      - created_at (timestamp)
      - updated_at (timestamp)
    
    - links
      - id (uuid, primary key)
      - project_id (uuid, foreign key)
      - type (text)
      - path (text)
      - timestamp (timestamp)
    
    - tasks
      - id (uuid, primary key)
      - project_id (uuid, foreign key)
      - content (text)
      - completed (boolean)
      - timestamp (timestamp)
    
    - activity_logs
      - id (uuid, primary key)
      - project_id (uuid, foreign key)
      - type (text)
      - description (text)
      - timestamp (timestamp)
    
    - quick_links
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - title (text)
      - url (text)
      - icon (text)
      - color (text)
      - timestamp (timestamp)
    
    - todos
      - id (uuid, primary key)
      - user_id (uuid, foreign key)
      - content (text)
      - completed (boolean)
      - timestamp (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  progress integer DEFAULT 0,
  color text DEFAULT '#64748B',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  path text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  completed boolean DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  description text NOT NULL,
  timestamp timestamptz DEFAULT now()
);

-- Create quick_links table
CREATE TABLE IF NOT EXISTS quick_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT 'external-link',
  color text DEFAULT '#64748B',
  timestamp timestamptz DEFAULT now()
);

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  completed boolean DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can manage their own data"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create policies for projects
CREATE POLICY "Users can manage their own projects"
  ON projects
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for links
CREATE POLICY "Users can manage project links"
  ON links
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = links.project_id
    AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = links.project_id
    AND projects.user_id = auth.uid()
  ));

-- Create policies for tasks
CREATE POLICY "Users can manage project tasks"
  ON tasks
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = tasks.project_id
    AND projects.user_id = auth.uid()
  ));

-- Create policies for activity_logs
CREATE POLICY "Users can manage project activity logs"
  ON activity_logs
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_logs.project_id
    AND projects.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = activity_logs.project_id
    AND projects.user_id = auth.uid()
  ));

-- Create policies for quick_links
CREATE POLICY "Users can manage their quick links"
  ON quick_links
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for todos
CREATE POLICY "Users can manage their todos"
  ON todos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects(user_id);
CREATE INDEX IF NOT EXISTS links_project_id_idx ON links(project_id);
CREATE INDEX IF NOT EXISTS tasks_project_id_idx ON tasks(project_id);
CREATE INDEX IF NOT EXISTS activity_logs_project_id_idx ON activity_logs(project_id);
CREATE INDEX IF NOT EXISTS quick_links_user_id_idx ON quick_links(user_id);
CREATE INDEX IF NOT EXISTS todos_user_id_idx ON todos(user_id);