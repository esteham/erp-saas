<?php
class LocationManager 
{
    private $pdo;

    public function __construct()
    {
        $host = 'localhost';
        $db = 'service_provider';
        $user = 'root';
        $pass = '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host; dbname=$db; charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        
        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            die('DB Connection Failed: ' . $e->getMessage());
        }

    }

    // ---------- Division ----------
    public function createDivision($name) {
        $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM divisions WHERE name = ?");
        $stmt->execute([$name]);
        $count = $stmt->fetchColumn();

        if ($count > 0) {
            return false;
        }
        $stmt = $this->pdo->prepare("INSERT INTO divisions (name) VALUES (?)");
        return $stmt->execute([$name]);
    }

    public function getDivisions() {
        $stmt = $this->pdo->query("SELECT * FROM divisions");
        return $stmt->fetchAll();
    }

    public function updateDivision($id, $name) {
        $stmt = $this->pdo->prepare("UPDATE divisions SET name = ? WHERE id = ?");
        return $stmt->execute([$name, $id]);
    }

    public function deleteDivision($id) {
        $stmt = $this->pdo->prepare("DELETE FROM divisions WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- District ----------
    public function createDistrict($division_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO districts (division_id, name) VALUES (?, ?)");
        return $stmt->execute([$division_id, $name]);
    }

    public function getDistricts($division_id = null) {
        if ($division_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM districts WHERE division_id = ?");
            $stmt->execute([$division_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM districts")->fetchAll();
        }
    }

    public function updateDistrict($id, $division_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE districts SET division_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$division_id, $name, $id]);
    }

    public function deleteDistrict($id) {
        $stmt = $this->pdo->prepare("DELETE FROM districts WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- Upazila ----------
    public function createUpazila($district_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO upazilas (district_id, name) VALUES (?, ?)");
        return $stmt->execute([$district_id, $name]);
    }

    public function getUpazilas($district_id = null) {
        if ($district_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM upazilas WHERE district_id = ?");
            $stmt->execute([$district_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM upazilas")->fetchAll();
        }
    }

    public function updateUpazila($id, $district_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE upazilas SET district_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$district_id, $name, $id]);
    }

    public function deleteUpazila($id) {
        $stmt = $this->pdo->prepare("DELETE FROM upazilas WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- Zone ----------
    public function createZone($upazila_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO zones (upazila_id, name) VALUES (?, ?)");
        return $stmt->execute([$upazila_id, $name]);
    }

    public function getZones($upazila_id = null) {
        if ($upazila_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM zones WHERE upazila_id = ?");
            $stmt->execute([$upazila_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM zones")->fetchAll();
        }
    }

    public function updateZone($id, $upazila_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE zones SET upazila_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$upazila_id, $name, $id]);
    }

    public function deleteZone($id) {
        $stmt = $this->pdo->prepare("DELETE FROM zones WHERE id = ?");
        return $stmt->execute([$id]);
    }

    // ---------- Area ----------
    public function createArea($zone_id, $name) {
        $stmt = $this->pdo->prepare("INSERT INTO areas (zone_id, name) VALUES (?, ?)");
        return $stmt->execute([$zone_id, $name]);
    }

    public function getAreas($zone_id = null) {
        if ($zone_id) {
            $stmt = $this->pdo->prepare("SELECT * FROM areas WHERE zone_id = ?");
            $stmt->execute([$zone_id]);
            return $stmt->fetchAll();
        } else {
            return $this->pdo->query("SELECT * FROM areas")->fetchAll();
        }
    }

    public function updateArea($id, $zone_id, $name) {
        $stmt = $this->pdo->prepare("UPDATE areas SET zone_id = ?, name = ? WHERE id = ?");
        return $stmt->execute([$zone_id, $name, $id]);
    }

    public function deleteArea($id) {
        $stmt = $this->pdo->prepare("DELETE FROM areas WHERE id = ?");
        return $stmt->execute([$id]);
    }

    /* ==============
    Location Management
    ================*/
    public function getAllDivisions()
    {
        $sql = "SELECT * FROM divisions ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getDistrictsByDivision($divisionId)
    {
        $sql = "SELECT * FROM districts WHERE division_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$divisionId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getUpazilasByDistrict($districtId)
    {
        $sql = "SELECT * FROM upazilas WHERE district_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$districtId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getZonesByUpazila($upazilaId)
    {
        $sql = "SELECT * FROM zones WHERE upazila_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$upazilaId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function getAreasByZone($zoneId)
    {
        $sql = "SELECT * FROM areas WHERE zone_id = ? ORDER BY name ASC";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$zoneId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

}