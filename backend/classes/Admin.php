<?php
class Admin
{
	private $pdo;

	public function __construct()
	{
		$host   = "localhost";
		$db     = "local_service";
		$user   = "root";
		$pass   = "";
		$charset= "utf8mb4";

		$dsn = "mysql:host=$host; dbname=$db; charset=$charset";
		$options = [

			PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
			PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
		];

		try
		{
			$this->pdo = new PDO($dsn, $user, $pass, $options);
		}

		catch(PDOException $e)
		{
			die("DB Connection Failed: ".$e->getMessage());
		}

	}

	public function getPDO()
	{
		return $this->pdo;
	}

	//User Login

	public function login($username, $password)
	{
		$stmt = $this->pdo->prepare("SELECT * FROM users WHERE username=? AND status = 'active'");

		$stmt->execute([$username]);
		$user = $stmt->fetch();

		if($user && password_verify($password, $user['password']))
		{
			//Success
			return [

				'success'=>true,
				'data' => [
						'id'=>$user['id'],
						'employee_id'=>$user['employee_id'],
						'role' => $user['role'],
				],
			];
		}

		else
		{
			return ['success'=> false, 'message'=>'Invalid login credentials'];
		}
	}

	//Record Attendance

	public function recordAttendance($employeeId)
	{
		$today = date('Y-m-d');
		$timeNow = date('h:i:s');

		//Check if already marked today

		$check = $this->pdo->prepare("SELECT id FROM attendance WHERE employee_id = ? AND date = ?");
		$check->execute([$employeeId, $today]); 

		if($check->rowCount() > 0)
		{
			return ['success'=> false, 'message' => 'Already marked today'];
		}

		//Check if today is weekend or holiday
		$day = date('l');
		$holidayCheck = $this->pdo->prepare("SELECT id FROM holidays WHERE holiday_date = ?");
		$holidayCheck ->execute([$today]);
		$isHoliday = $holidayCheck->rowCount() > 0 ? 1 : 0;

		$weekendCheck = $this->pdo->prepare("SELECT id FROM weekends WHERE day_of_week	= ?");

		$weekendCheck->execute([$day]);

		$isWeekend =  $weekendCheck->rowCount() > 0 ? 1 : 0;

		//Get login rules
		$rule = $this->pdo->prepare("SELECT * FROM login_rules WHERE employee_id = ?");
		$rule->execute([$employeeId]);
		$loginRule = $rule->fetch();

		$isLate = 0;
		$fine = 0;

		if($loginRule)
		{
			$officialTime = strtotime($loginRule['login_time']);
			$grace = $loginRule['grace_period_minutes'] * 60;
			$current = strtotime($timeNow);

			if($current > ($officialTime + $grace) && !$isWeekend && !$isHoliday)
			{
				$isLate = 1;
				$fine = $loginRule['fine_per_day'];
			}
		}

		//Insert Attendance
		$insert = $this->pdo->prepare("INSERT INTO attendance (employee_id, date, check_in, is_late, is_weekend, is_holiday, late_fine) VALUES (?,?,?,?,?,?,?)");

		$insert->execute([$employeeId,$today, $timeNow, $isLate, $isWeekend, $isHoliday, $fine]);

		//Log late fine if needed

		if($isLate && $fine > 0)
		{
			$attendanceId = $this->pdo->lastInsertId();
			$fineLog = $this->pdo->prepare("INSERT INTO late_fines(employee_id, attendance_id, date, fine_amount) VALUES (?,?,?,?)");
			$fineLog->execute([$employeeId, $attendanceId, $today, $fine]);
		}

		return ['success' => true, 'message' => 'Attendance Recorded', 'late' => $isLate, 'fine' => $fine];

	}

	//Check if already marked today
	public function checkTodayAttendance($employeeId)
	{
		$today = date('Y-m-d');

		$stmt = $this->pdo->prepare("SELECT check_in FROM attendance WHERE employee_id = ? AND date = ?");
		$stmt->execute([$employeeId, $today]);

		if($stmt->rowCount() > 0)
		{
			$row = $stmt->fetch();
			return [
					'already_marked' => true,
					'check_in' => $row['check_in'],

					];
		}

		return ['already_marked' => false];
	} 


	public function payrollExists($employeeId, $month, $year)
	{
		$stmt = $this->pdo->prepare("SELECT id FROM payroll WHERE employee_id = ? AND month = ? AND year = ?");

		$stmt->execute([$employeeId, $month, $year]);

		return $stmt->rowCount() > 0;
	}

	public function generatePayroll($employeeId, $month, $year, $bonus = 0, $deduction = 0, $overTimeHours = 0)
	{
		$stmt = $this->pdo->prepare("SELECT basic_salary, overtime_rate FROM salary_structure WHERE employee_id = ?");
		$stmt->execute([$employeeId]);
		$salaryData = $stmt->fetch();

		if(!$salaryData)
		{
			return ['success' => false, 'message' => 'Salary structure not found'];
		}

		$basicSalary = $salaryData['basic_salary'];
		$overtimeRate = $salaryData['overtime_rate'];

		//Count working days and late fines

		$start = "$year-$month-01";
		$end = date("Y-m-t", strtotime($start));

		$attStmt = $this->pdo->prepare("SELECT COUNT(*) as total_present FROM attendance WHERE employee_id = ? AND date BETWEEN ? AND ? AND is_weekend = 0 AND is_holiday = 0");
		$attStmt->execute([$employeeId, $start, $end]);
		$totalPresent = $attStmt->fetch()['total_present'];

		//Sum of late fine in the month

		$fineStmt = $this->pdo->prepare("SELECT SUM(fine_amount) as total_fine FROM late_fines WHERE employee_id = ? AND date BETWEEN ? AND ?");

		$fineStmt->execute([$employeeId, $start, $end]);

		$totalFine = $fineStmt->fetch()['total_fine'] ?? 0;

		//Overtime pay

		$overtimePay = $overTimeHours * $overtimeRate;

		//Final Net Salary

		$netSalary = $basicSalary + $bonus + $overtimePay - $deduction - $totalFine;

		//Insert into Payroll table

		$insert = $this->pdo->prepare("INSERT INTO payroll (employee_id, month, year, basic_salary, bonus, overtime, deduction, late_fine, net_salary) VALUES (?,?,?,?,?,?,?,?,?)");

		$insert->execute([$employeeId, $month, $year, $basicSalary, $bonus, $overtimePay, $deduction, $totalFine, $netSalary]);

		return [

				'success' => true,
				'message' => 'Payroll generated successfully',
				'net_salary' => $netSalary,
				'details' => [

						'present_day' => $totalPresent,
						'overtime' => $overTimeHours,
						'late_fine' => $totalFine,
						'bonus' => $bonus,
						'deduction' => $deduction,
				],
		];
	}


	public function getPayrollReport($month, $year)
	{
		$sql = "SELECT
					p.id,
					e.name AS employee_name,
					e.email,
					p.month,
					p.year,
					p.basic_salary,
					p.bonus,
					p.overtime,
					p.deduction,
					p.late_fine,
					p.net_salary,
					p.generated_at

					FROM payroll p JOIN employees e ON p.employee_id = e.id
					WHERE p.month = ? AND p.year = ?
					ORDER BY e.name ASC";
		$stmt = $this->pdo->prepare($sql);

		$stmt->execute([$month, $year]);

		return $stmt->fetchAll();
	}

	//Holiday Select

	public function getHolidays()
	{
		$stmt = $this->pdo->query("SELECT id, title, holiday_date FROM holidays ORDER BY holiday_date ASC");
		return $stmt->fetchAll();
	}

	public function getWeekends()
	{
		$sql = "SELECT day_of_week FROM weekends ORDER BY id ASC";

		$stmt = $this->pdo->query($sql);

		return $stmt->fetchAll(PDO::FETCH_ASSOC);
	}

	public function sendMail($email, $message, $subject, $attachment = [])
	{
		require_once __DIR__ . '/../classes/PHPMailer/PHPMailer.php';
		require_once __DIR__ . '/../classes/PHPMailer/SMTP.php';

		$mail = new PHPMailer\PHPMailer\PHPMailer();
		//$mail->SMTPDebug = 2;

		$mail->isSMTP();
		$mail->Host = 'smtp.gmail.com';
		$mail->SMTPAuth = true;
		$mail->Username = 'araman666@gmail.com';
		$mail->Password = 'upbbwchcqvwkzfzf';
		$mail->SMTPSecure = 'tls';
		$mail->Port = 587;

		$mail->setFrom('araman666@gmail.com','Cogent HR');
		$mail->addAddress($email);
		//Attachment
		foreach ($attachment as $filePath)
		{
			if(file_exists($filePath))
			{
				$mail->addAttachment($filePath);
			}
		}
		$mail->isHTML(true);
		$mail->Subject = $subject;
		$mail->Body = $message;

		if(!$mail->send())
		{
			$_SESSION['mailError'] = $mail->ErrorInfo;
			return false;
		}

		else
		{
			return true;
		}

	}

	public function createGroup($group_name, $description, $created_by)
	{
		$stmt = $this->pdo->prepare("INSERT INTO groups (group_name, description, created_by) VALUES (?,?,?)");
		$stmt->execute([$group_name, $description, $created_by]);
		return $this->pdo->lastInsertId(); 
	}

	public function addEmployeesToGroup($group_id, $employee_ids = [])
	{
		$stmt = $this->pdo->prepare("INSERT INTO group_members(group_id, employee_id) VALUES (?,?)");

		foreach ($employee_ids as $emp_id)
		{
			$stmt->execute([$group_id, $emp_id]);	
		}

		return true;
	}


}
