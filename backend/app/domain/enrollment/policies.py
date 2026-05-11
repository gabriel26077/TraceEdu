from abc import ABC, abstractmethod
from app.domain.enrollment.entities.enrollment import Enrollment, Grade
from app.domain.enrollment.value_objects import EnrollmentStatus, GradeType

class PromotionPolicy(ABC):
    """
    Defines the rules for student promotion (pass/fail).
    Different schools can implement their own logic.
    """
    @abstractmethod
    def evaluate(self, enrollment: Enrollment) -> EnrollmentStatus:
        pass

class RecoveryPolicy(ABC):
    """
    Defines how a recovery grade affects the enrollment performance.
    Handles the 'weird logic' schools might have for recovery.
    """
    @abstractmethod
    def apply(self, enrollment: Enrollment, recovery_grade: Grade) -> None:
        pass

class SimpleAveragePromotionPolicy(PromotionPolicy):
    """
    A standard promotion policy based on a minimum average and maximum absences.
    """
    def __init__(self, min_grade: float = 7.0, max_absences: int = 20):
        self.min_grade = min_grade
        self.max_absences = max_absences

    def evaluate(self, enrollment: Enrollment) -> EnrollmentStatus:
        # 1. Check absences first (automatic fail if above threshold)
        if enrollment.total_absences > self.max_absences:
            return EnrollmentStatus.FAILED
            
        # 2. Calculate average of regular grades
        regular_grades = [g.value.value for g in enrollment.grades if g.grade_type == GradeType.REGULAR]
        
        if not regular_grades:
            return EnrollmentStatus.ENROLLED
            
        average = sum(regular_grades) / len(regular_grades)
        
        # 3. Determine status based on average
        if average >= self.min_grade:
            return EnrollmentStatus.APPROVED
            
        return EnrollmentStatus.FAILED

class SubstitutionRecoveryPolicy(RecoveryPolicy):
    """
    A recovery policy where the recovery grade replaces the regular grade
    for the same term, but only if the recovery grade is higher.
    """
    def apply(self, enrollment: Enrollment, recovery_grade: Grade) -> None:
        if recovery_grade.grade_type != GradeType.RECOVERY:
            return

        # Find the regular grade for the same term
        for i, grade in enumerate(enrollment.grades):
            if grade.term == recovery_grade.term and grade.grade_type == GradeType.REGULAR:
                # If recovery is higher, we 'substitute' by updating the value
                if recovery_grade.value.value > grade.value.value:
                    # In a real DDD scenario, we might want to keep both grades for audit
                    # but change which one is 'active' or used for calculations.
                    # For now, we update the list.
                    enrollment.grades[i] = Grade(
                        uid=grade.uid,
                        term=grade.term,
                        value=recovery_grade.value,
                        grade_type=GradeType.REGULAR # It becomes the new regular grade
                    )
                break
        
        # Add the recovery grade to the history regardless
        enrollment.add_grade(recovery_grade)
