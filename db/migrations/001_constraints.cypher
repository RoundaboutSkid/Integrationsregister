// Unique ID constraints for core entities
CREATE CONSTRAINT app_id IF NOT EXISTS FOR (n:Application) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT int_id IF NOT EXISTS FOR (n:Integration) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT sol_id IF NOT EXISTS FOR (n:IntegrationSolution) REQUIRE n.id IS UNIQUE;
CREATE CONSTRAINT ord_id IF NOT EXISTS FOR (n:IntegrationOrder) REQUIRE n.id IS UNIQUE;

