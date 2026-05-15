import math
from typing import List, Dict, Optional
from app.domain.academic.repositories.grade_repository import GradeRepository
from app.domain.academic.repositories.subject_offering_repository import SubjectOfferingRepository
from app.domain.subject.repositories.subject_repository import SubjectRepository

class GetOfferingStatsUseCase:
    def __init__(
        self, 
        grade_repo: GradeRepository, 
        offering_repo: SubjectOfferingRepository,
        subject_repo: SubjectRepository
    ):
        self.grade_repo = grade_repo
        self.offering_repo = offering_repo
        self.subject_repo = subject_repo

    def execute(self, offering_id: str) -> dict:
        offering = self.offering_repo.get_by_id(offering_id)
        if not offering:
            raise Exception("Offering not found")
            
        subject = self.subject_repo.get_by_id(offering.subject_id)
        if not subject:
            raise Exception("Subject not found")
            
        all_grades = self.grade_repo.list_by_offering(offering_id)
        
        # Organize grades by unit and assessment
        # grades_map[unit][assessment_number] = [values]
        grades_map = {}
        for u in range(1, subject.academic_units + 1):
            grades_map[u] = {}
            for a in range(1, subject.assessments_per_unit + 1):
                grades_map[u][a] = []
        
        for g in all_grades:
            if g.unit in grades_map and g.assessment_number in grades_map[g.unit]:
                grades_map[g.unit][g.assessment_number].append(g.value)
                
        units_stats = []
        
        for u in range(1, subject.academic_units + 1):
            assessments_stats = []
            
            # Map of student_id -> list of grades for this unit to calculate student mean
            student_unit_grades = {}
            
            for a in range(1, subject.assessments_per_unit + 1):
                values = grades_map[u][a]
                stats = self._calculate_basic_stats(values)
                assessments_stats.append(stats)
                
            # Calculate unit-level stats based on student averages
            # We need to collect grades per student for this unit
            unit_grades = [g for g in all_grades if g.unit == u]
            for g in unit_grades:
                if g.student_id not in student_unit_grades:
                    student_unit_grades[g.student_id] = []
                student_unit_grades[g.student_id].append(g.value)
            
            student_means = []
            for s_id, s_vals in student_unit_grades.items():
                if s_vals:
                    # Simple average for now
                    student_means.append(sum(s_vals) / len(s_vals))
            
            unit_summary = self._calculate_basic_stats(student_means)
            
            units_stats.append({
                "assessments": assessments_stats,
                "mean": unit_summary["mean"],
                "stddev": unit_summary["stddev"],
                "histogram": unit_summary["histogram"]
            })
            
        return {"units": units_stats}

    def _calculate_basic_stats(self, values: List[float]) -> dict:
        if not values:
            return {
                "mean": 0.0,
                "stddev": 0.0,
                "histogram": [0] * 10
            }
            
        n = len(values)
        mean = sum(values) / n
        
        variance = sum((x - mean) ** 2 for x in values) / n
        stddev = math.sqrt(variance)
        
        # Histogram with 10 bins: 0-1, 1-2, ..., 9-10
        histogram = [0] * 10
        for v in values:
            bin_idx = min(int(v), 9) # v=10 goes to bin 9
            if v == 10: bin_idx = 9
            histogram[bin_idx] += 1
            
        return {
            "mean": round(mean, 2),
            "stddev": round(stddev, 2),
            "histogram": histogram
        }
