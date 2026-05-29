import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-exam-result',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="exam-result">
      <a [routerLink]="['/exams', examId]" class="back-link">← Back to Exam Schedule</a>

      @if (submission(); as sub) {
        <div class="result-header">
          <h1>Exam Results</h1>
          <p class="subtitle">{{ schedule?.subject }} - {{ exam?.name }}</p>
        </div>

        <div class="score-card" [class.passed]="isPassed()" [class.failed]="!isPassed()">
          <div class="score-circle">
            <span class="score-percent">{{ percentage() }}%</span>
            <span class="score-label">Score</span>
          </div>
          <div class="score-details">
            <div class="score-row">
              <span>Total Marks</span>
              <span class="score-val">{{ sub.totalMarks }}</span>
            </div>
            <div class="score-row">
              <span>Obtained Marks</span>
              <span class="score-val highlight">{{ sub.obtainedMarks }}</span>
            </div>
            <div class="score-row">
              <span>Passing Marks</span>
              <span class="score-val">{{ schedule?.passingMarks ?? '-' }}</span>
            </div>
            <div class="score-row">
              <span>Status</span>
              <span class="result-badge" [class.pass]="isPassed()" [class.fail]="!isPassed()">
                {{ isPassed() ? 'PASSED' : 'FAILED' }}
              </span>
            </div>
            <div class="score-row">
              <span>Submitted</span>
              <span class="score-val">{{ sub.submittedAt }}</span>
            </div>
          </div>
        </div>

        <h2 class="section-title">Answer Review</h2>
        <div class="answers-list">
          @for (question of questions(); track question.id; let i = $index) {
            @let answer = getAnswer(sub, question.id);
            <div class="answer-card" [class.correct]="answer?.isCorrect" [class.wrong]="answer && !answer.isCorrect">
              <div class="answer-header">
                <span class="q-num">Q{{ question.questionNumber }}</span>
                <span class="q-type-badge" [class]="question.type">{{ question.type === 'mcq' ? 'MCQ' : 'Short Answer' }}</span>
                <span class="marks-badge" [class.full]="answer?.isCorrect">
                  {{ answer?.marksAwarded ?? 0 }} / {{ question.marks }}
                </span>
              </div>
              <p class="q-text">{{ question.questionText }}</p>

              @if (question.type === 'mcq' && question.options) {
                <div class="options-review">
                  @for (option of question.options; track option; let j = $index) {
                    <div class="option-review"
                      [class.correct-option]="option === question.correctAnswer"
                      [class.selected-wrong]="option === answer?.answer && !answer?.isCorrect"
                      [class.selected-correct]="option === answer?.answer && answer?.isCorrect">
                      <span class="opt-letter">{{ ['A', 'B', 'C', 'D'][j] }}</span>
                      <span class="opt-text">{{ option }}</span>
                      @if (option === question.correctAnswer) {
                        <span class="opt-icon correct-icon">&#10003;</span>
                      }
                      @if (option === answer?.answer && !answer?.isCorrect) {
                        <span class="opt-icon wrong-icon">&#10007;</span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="short-answer-review">
                  <div class="answer-row">
                    <span class="answer-label">Your Answer:</span>
                    <span class="answer-value" [class.correct-text]="answer?.isCorrect" [class.wrong-text]="answer && !answer.isCorrect">
                      {{ answer?.answer || '(No answer)' }}
                      @if (answer?.isCorrect) { <span class="inline-icon">&#10003;</span> }
                      @if (answer && !answer.isCorrect) { <span class="inline-icon wrong">&#10007;</span> }
                    </span>
                  </div>
                  <div class="answer-row">
                    <span class="answer-label">Correct Answer:</span>
                    <span class="answer-value correct-text">{{ question.correctAnswer }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      } @else {
        <div class="no-result">
          <p>No submission found. You have not taken this exam yet.</p>
          <a [routerLink]="['/exams', examId, 'take', scheduleId]" class="btn-primary">Take Exam</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    .result-header { margin: 16px 0 20px; }
    .result-header h1 { margin: 0; color: var(--primary); }
    .subtitle { color: var(--text-secondary); margin: 4px 0 0; }
    .score-card { display: flex; gap: 32px; align-items: center; background: var(--card-bg); border-radius: 16px; padding: 28px 32px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); border-left: 6px solid #ccc; margin-bottom: 28px; }
    .score-card.passed { border-left-color: var(--success-dark); }
    .score-card.failed { border-left-color: var(--danger); }
    .score-circle { width: 120px; height: 120px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
    .passed .score-circle { background: linear-gradient(135deg, #e8f5e9, #c8e6c9); }
    .failed .score-circle { background: linear-gradient(135deg, #ffebee, #ffcdd2); }
    .score-percent { font-size: 28px; font-weight: 800; }
    .passed .score-percent { color: var(--success-dark); }
    .failed .score-percent { color: var(--danger); }
    .score-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; }
    .score-details { flex: 1; }
    .score-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); font-size: 14px; color: var(--text-secondary); }
    .score-row:last-child { border-bottom: none; }
    .score-val { font-weight: 700; color: var(--text-primary); }
    .score-val.highlight { color: var(--primary); font-size: 16px; }
    .result-badge { padding: 3px 12px; border-radius: var(--card-radius); font-size: 12px; font-weight: 700; }
    .result-badge.pass { background: var(--success-bg); color: var(--success-dark); }
    .result-badge.fail { background: var(--danger-bg); color: var(--danger); }

    .section-title { color: var(--primary); font-size: 18px; margin: 0 0 16px; }
    .answers-list { display: flex; flex-direction: column; gap: 16px; }
    .answer-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); border-left: 4px solid #e0e0e0; }
    .answer-card.correct { border-left-color: #66bb6a; }
    .answer-card.wrong { border-left-color: #ef5350; }
    .answer-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .q-num { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 3px 10px; border-radius: var(--card-radius); font-size: 12px; font-weight: 700; }
    .q-type-badge { padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; }
    .q-type-badge.mcq { background: var(--info-bg); color: var(--info); }
    .q-type-badge.short_answer { background: #f3e5f5; color: #7b1fa2; }
    .marks-badge { padding: 3px 10px; border-radius: 10px; font-size: 12px; font-weight: 700; background: var(--danger-bg); color: var(--danger); margin-left: auto; }
    .marks-badge.full { background: var(--success-bg); color: var(--success-dark); }
    .q-text { font-size: 15px; color: var(--text-primary); line-height: 1.5; margin: 0 0 12px; }

    .options-review { display: flex; flex-direction: column; gap: 8px; }
    .option-review { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border: 2px solid #e8e8e8; border-radius: 10px; font-size: 14px; }
    .option-review.correct-option { border-color: #66bb6a; background: #f1f8e9; }
    .option-review.selected-wrong { border-color: #ef5350; background: #fff5f5; }
    .option-review.selected-correct { border-color: #66bb6a; background: #f1f8e9; }
    .opt-letter { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #f8fafc; font-weight: 700; font-size: 12px; color: var(--text-secondary); flex-shrink: 0; }
    .correct-option .opt-letter { background: #66bb6a; color: #fff; }
    .selected-wrong .opt-letter { background: #ef5350; color: #fff; }
    .opt-text { flex: 1; }
    .opt-icon { font-size: 16px; font-weight: 700; }
    .correct-icon { color: var(--success-dark); }
    .wrong-icon { color: var(--danger); }

    .short-answer-review { display: flex; flex-direction: column; gap: 8px; }
    .answer-row { display: flex; gap: 12px; align-items: baseline; }
    .answer-label { font-size: 13px; color: var(--text-muted); font-weight: 600; min-width: 110px; }
    .answer-value { font-size: 14px; font-weight: 600; }
    .correct-text { color: var(--success-dark); }
    .wrong-text { color: var(--danger); }
    .inline-icon { font-size: 14px; margin-left: 4px; }
    .inline-icon.wrong { color: var(--danger); }

    .no-result { text-align: center; padding: 40px; color: var(--text-muted); }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border-radius: 10px; text-decoration: none; font-weight: 700; display: inline-block; margin-top: 12px; }
  `]
})
export class ExamResultComponent {
  private route = inject(ActivatedRoute);
  private examService = inject(ExamService);
  readonly authService = inject(AuthService);

  examId = Number(this.route.snapshot.paramMap.get('id'));
  scheduleId = Number(this.route.snapshot.paramMap.get('scheduleId'));

  exam = this.examService.getExamById(this.examId);
  schedule = this.exam
    ? this.examService.getSchedulesByExamId(this.exam.id).find(s => s.id === this.scheduleId)
    : undefined;

  readonly submission = computed(() => {
    const user = this.authService.user();
    if (!user) return undefined;
    return this.examService.getSubmissionByStudentAndSchedule(user.id, this.scheduleId);
  });

  readonly questions = computed(() => {
    return this.examService.getQuestionsByScheduleId(this.scheduleId);
  });

  readonly percentage = computed(() => {
    const sub = this.submission();
    if (!sub || sub.totalMarks === 0) return 0;
    return Math.round((sub.obtainedMarks / sub.totalMarks) * 100);
  });

  isPassed(): boolean {
    const sub = this.submission();
    if (!sub || !this.schedule) return false;
    return sub.obtainedMarks >= this.schedule.passingMarks;
  }

  getAnswer(sub: { answers: { questionId: number; answer: string; isCorrect: boolean; marksAwarded: number }[] }, questionId: number) {
    return sub.answers.find(a => a.questionId === questionId);
  }
}
