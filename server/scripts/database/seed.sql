INSERT INTO users (login, name, email, url, avatar_url, bio, website_url, location, company) VALUES
  ('belchior', 'Belchior Oliveira', 'belchior@email.com', 'https://github.com/belchior', 'https://avatars3.githubusercontent.com/u/2656585?u=de302ff93b129cf3841471deb188a5f5e51a2417&v=4', 'Software engineer', 'https://twitter.com/belchiorso', 'Brasil', 'Belchior Org'),
  ('foo', 'Foo', 'foo@email.com', 'https://github.com/foo', 'https://foo.com/avatar.jpg', null, null, 'Brasil', 'Foo Company'),
  ('bar', 'Bar', 'bar@email.com', 'https://github.com/bar', 'https://bar.com/avatar.jpg', 'Bio of Bar', null, 'Brasil', 'Bar Company'),
  ('dee', 'Dee', 'dee@email.com', 'https://github.com/dee', 'https://dee.com/avatar.jpg', 'Bio of Dee', null, 'Brasil', 'Dee Company');

INSERT INTO users_following (user_login, following_login) VALUES
  ('belchior', 'foo'),
  ('belchior', 'bar'),
  ('belchior', 'dee'),
  ('foo', 'dee'),
  ('bar', 'dee'),
  ('bar', 'belchior'),
  ('dee', 'bar'),
  ('dee', 'belchior');

INSERT INTO organizations (organization_id, login, url, name, description, avatar_url, location) 
OVERRIDING SYSTEM VALUE
VALUES
  (1000, 'belchior-org', 'https://github.com/belchior-org', 'My Org', 'Test Org', 'https://avatars3.githubusercontent.com/u/2656585?u=de302ff93b129cf3841471deb188a5f5e51a2417&v=4', 'Brasil'),
  (1001, 'rust-lang', 'https://github.com/rust-lang', 'The Rust Programming Language', 'Empowering everyone to build reliable and efficient software.', 'https://avatars.githubusercontent.com/u/5430905?s=200&v=4', null);

INSERT INTO users_organizations (user_login, organization_login) VALUES
  ('belchior', 'belchior-org'),
  ('foo', 'rust-lang');

INSERT INTO languages (language_name, language_color) VALUES
  ('JavaScript','#f1e05a'),
  ('Python','#3572A5'),
  ('Rust', '#dea584'),
  ('Shell','#89e051'),
  ('TypeScript','#2b7489');

INSERT INTO licenses (license_key, license_name) VALUES
  ('unlicense', 'The Unlicense'),
  ('mit', 'MIT License'),
  ('apache-2.0', 'Apache-2.0'),
  ('gpl-2.0', 'GPL-2.0'),
  ('gpl-3.0', 'GPL-3.0');

INSERT INTO repositories (name, repository_id, fork_count, owner_login, owner_ref, primary_language, url, description)
OVERRIDING SYSTEM VALUE
VALUES
  ('rust', 1, 8612, 'rust-lang', 'organizations', 'Rust', 'https://github.com/rust-lang/rust', 'Empowering everyone to build reliable and efficient software.'),
  ('cargo', 2, 1583, 'rust-lang', 'organizations', 'Rust', 'https://github.com/rust-lang/cargo', 'The Rust package manager'),
  ('rust_web_server', 3, 0, 'belchior', 'users', 'Rust', 'https://github.com/belchior/rust_web_server', 'Project description'),
  ('typescript_web_server', 4, 0, 'belchior', 'users', 'TypeScript', 'https://github.com/belchior/rust_web_server', 'The purpose of this repository is to practice GraphQL acquired knowledge as well as the ecosystem'),
  ('sql_query_builder', 5, 8, 'belchior', 'users', 'Rust', 'https://github.com/belchior/rust_web_server', 'Write SQL queries in a simple and composable way'),
  ('repo_foo', 6, 123, 'belchior-org', 'organizations', 'Rust', 'https://github.com/belchior-org/repo_foo', 'The Foo repository'),
  ('repo_bar', 7, 745, 'belchior-org', 'organizations', 'TypeScript', 'https://github.com/belchior-org/repo_bar', 'The Bar repository')
;

INSERT INTO repositories_licenses (repository_id, license_key) VALUES
  (1, 'mit'),
  (1, 'apache-2.0'),
  (1, 'gpl-2.0'),
  (1, 'gpl-3.0'),
  (2, 'mit'),
  (2, 'gpl-2.0'),
  (3, 'mit');

INSERT INTO users_starred_repositories (user_login, repository_id) VALUES
  ('belchior', 1),
  ('belchior', 2),
  ('bar', 2);