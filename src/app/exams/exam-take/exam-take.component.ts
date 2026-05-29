import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExamQuestion } from '../../shared/models/exam.model';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="exam-take">
      @if (exam && schedule) {
        @if (alreadySubmitted()) {
          <div class="already-submitted">
            <div class="submitted-icon">📋</div>
            <h2>Already Submitted</h2>
            <p>You have already submitted this exam.</p>
            <div class="result-summary">
              <div class="result-card">
                <span class="result-label">Score</span>
                <span class="result-value">{{ existingSubmission()!.obtainedMarks }} / {{ existingSubmission()!.totalMarks }}</span>
              </div>
              <div class="result-card">
                <span class="result-label">Percentage</span>
                <span class="result-value">{{ ((existingSubmission()!.obtainedMarks / existingSubmission()!.totalMarks) * 100).toFixed(1) }}%</span>
              </div>
            </div>
            <div class="nav-actions">
              <a [routerLink]="['/exams', exam.id, 'schedule', schedule.id, 'result']" class="btn-primary">View Detailed Results</a>
              <a [routerLink]="['/exams', exam.id]" class="btn-secondary">Back to Exam</a>
            </div>
          </div>
        } @else if (!started()) {
          <div class="exam-intro">
            <a [routerLink]="['/exams', exam.id]" class="back-link">← Back to Exam Schedule</a>
            <div class="intro-card">
              <h1>{{ schedule.subject }}</h1>
              <p class="subtitle">{{ exam.name }} | Class {{ exam.class }}-{{ exam.section }}</p>
              <div class="exam-info-grid">
                <div class="exam-info-item">
                  <span class="info-icon">📅</span>
                  <div>
                    <span class="info-label">Date</span>
                    <span class="info-value">{{ schedule.date }}</span>
                  </div>
                </div>
                <div class="exam-info-item">
                  <span class="info-icon">⏰</span>
                  <div>
                    <span class="info-label">Duration</span>
                    <span class="info-value">{{ schedule.startTime }} - {{ schedule.endTime }}</span>
                  </div>
                </div>
                <div class="exam-info-item">
                  <span class="info-icon">📝</span>
                  <div>
                    <span class="info-label">Questions</span>
                    <span class="info-value">{{ questions.length }}</span>
                  </div>
                </div>
                <div class="exam-info-item">
                  <span class="info-icon">🎯</span>
                  <div>
                    <span class="info-label">Max Marks</span>
                    <span class="info-value">{{ schedule.maxMarks }}</span>
                  </div>
                </div>
              </div>
              <div class="instructions">
                <h3>Instructions</h3>
                <ul>
                  <li>Read each question carefully before answering.</li>
                  <li>For MCQ questions, select the correct option.</li>
                  <li>For short answer questions, type your answer in the text field.</li>
                  <li>You can navigate between questions using the question palette.</li>
                  <li>Review your answers before submitting.</li>
                  <li>Once submitted, you cannot change your answers.</li>
                </ul>
              </div>
              @if (questions.length > 0) {
                <button class="btn-start" (click)="started.set(true)">Start Exam</button>
              } @else {
                <p class="no-questions">No questions have been added to this exam yet.</p>
              }
            </div>
          </div>
        } @else {
          <div class="exam-container">
            <div class="exam-header">
              <div class="exam-title">
                <h2>{{ schedule.subject }} - {{ exam.name }}</h2>
                <span class="question-counter">Question {{ currentIndex() + 1 }} of {{ questions.length }}</span>
              </div>
              <div class="exam-progress">
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="progressPercent()"></div>
                </div>
                <span class="answered-count">{{ answeredCount() }} / {{ questions.length }} answered</span>
              </div>
            </div>

            <div class="exam-body">
              <div class="question-panel">
                @if (currentQuestion(); as q) {
                  <div class="question-card">
                    <div class="question-header">
                      <span class="q-number">Q{{ q.questionNumber }}</span>
                      <span class="q-marks">{{ q.marks }} marks</span>
                      <span class="q-type" [class]="q.type">{{ q.type === 'mcq' ? 'Multiple Choice' : 'Short Answer' }}</span>
                    </div>
                    <p class="question-text">{{ q.questionText }}</p>

                    @if (q.type === 'mcq' && q.options) {
                      <div class="options-list">
                        @for (option of q.options; track option; let i = $index) {
                          <label class="option-item" [class.selected]="answers().get(q.id) === option">
                            <input
                              type="radio"
                              [name]="'q_' + q.id"
                              [value]="option"
                              [checked]="answers().get(q.id) === option"
                              (change)="setAnswer(q.id, option)" />
                            <span class="option-letter">{{ ['A', 'B', 'C', 'D'][i] }}</span>
                            <span class="option-text">{{ option }}</span>
                          </label>
                        }
                      </div>
                    } @else {
                      <div class="short-answer">
                        <textarea
                          [value]="answers().get(q.id) ?? ''"
                          (input)="setAnswer(q.id, $any($event.target).value)"
                          placeholder="Type your answer here..."
                          rows="3"></textarea>
                      </div>
                    }
                  </div>
                }

                <div class="question-nav">
                  <button class="btn-nav" (click)="prevQuestion()" [disabled]="currentIndex() === 0">← Previous</button>
                  @if (currentIndex() < questions.length - 1) {
                    <button class="btn-nav btn-next" (click)="nextQuestion()">Next →</button>
                  } @else {
                    <button class="btn-submit" (click)="confirmSubmit()">Submit Exam</button>
                  }
                </div>
              </div>

              <div class="question-palette">
                <h3>Question Palette</h3>
                <div class="palette-grid">
                  @for (q of questions; track q.id; let i = $index) {
                    <button
                      class="palette-btn"
                      [class.current]="i === currentIndex()"
                      [class.answered]="answers().has(q.id)"
                      (click)="currentIndex.set(i)">
                      {{ i + 1 }}
                    </button>
                  }
                </div>
                <div class="palette-legend">
                  <span class="legend-item"><span class="dot current"></span> Current</span>
                  <span class="legend-item"><span class="dot answered"></span> Answered</span>
                  <span class="legend-item"><span class="dot unanswered"></span> Not Answered</span>
                </div>
                <button class="btn-submit-side" (click)="confirmSubmit()">Submit Exam</button>
              </div>
            </div>
          </div>
        }
      } @else {
        <p class="no-data">Exam or schedule not found.</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: var(--primary); text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    .exam-intro { max-width: 700px; margin: 0 auto; }
    .intro-card { background: var(--card-bg); border-radius: 16px; padding: 32px; margin-top: 16px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .intro-card h1 { margin: 0 0 4px; color: var(--primary); font-size: 28px; }
    .subtitle { color: var(--text-secondary); margin: 0 0 24px; }
    .exam-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
    .exam-info-item { display: flex; gap: 12px; align-items: center; background: #f8f9fe; border-radius: 10px; padding: 12px 16px; }
    .info-icon { font-size: 24px; }
    .info-label { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; }
    .info-value { display: block; font-size: 15px; font-weight: 700; color: var(--text-primary); }
    .instructions { background: #fffde7; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; border-left: 4px solid #fbc02d; }
    .instructions h3 { margin: 0 0 8px; color: #f57f17; font-size: 15px; }
    .instructions ul { margin: 0; padding-left: 20px; }
    .instructions li { font-size: 14px; color: var(--text-secondary); margin-bottom: 4px; }
    .btn-start { width: 100%; padding: 14px; background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border: none; border-radius: 10px; font-size: 16px; font-weight: 700; cursor: pointer; transition: var(--transition); }
    .btn-start:hover { background: var(--primary-dark); }
    .no-questions { text-align: center; color: var(--text-muted); font-style: italic; padding: 20px; }

    .exam-container { display: flex; flex-direction: column; gap: 16px; }
    .exam-header { background: var(--card-bg); border-radius: var(--card-radius); padding: 16px 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .exam-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .exam-title h2 { margin: 0; color: var(--primary); font-size: 18px; }
    .question-counter { font-size: 14px; color: var(--text-secondary); font-weight: 600; }
    .progress-bar { height: 6px; background: #e0e0e0; border-radius: 3px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #1a237e, #3f51b5); border-radius: 3px; transition: width 0.3s; }
    .answered-count { font-size: 12px; color: var(--text-muted); margin-top: 4px; display: inline-block; }
    .exam-progress { }

    .exam-body { display: grid; grid-template-columns: 1fr 240px; gap: 16px; }
    .question-panel { }
    .question-card { background: var(--card-bg); border-radius: var(--card-radius); padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .question-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .q-number { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 4px 12px; border-radius: 16px; font-size: 13px; font-weight: 700; }
    .q-marks { background: var(--success-bg); color: var(--success-dark); padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; }
    .q-type { padding: 4px 10px; border-radius: 16px; font-size: 12px; font-weight: 600; }
    .q-type.mcq { background: var(--info-bg); color: var(--info); }
    .q-type.short_answer { background: #f3e5f5; color: #7b1fa2; }
    .question-text { font-size: 16px; color: var(--text-primary); line-height: 1.6; margin: 0; }

    .options-list { display: flex; flex-direction: column; gap: 10px; margin-top: 20px; }
    .option-item { display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 2px solid #e0e0e0; border-radius: 10px; cursor: pointer; transition: var(--transition); }
    .option-item:hover { border-color: #90caf9; background: #f8f9fe; }
    .option-item.selected { border-color: var(--primary); background: var(--primary-bg); }
    .option-item input[type="radio"] { display: none; }
    .option-letter { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #f8fafc; font-weight: 700; font-size: 13px; color: var(--text-secondary); flex-shrink: 0; }
    .option-item.selected .option-letter { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; }
    .option-text { font-size: 14px; color: var(--text-primary); }

    .short-answer { margin-top: 16px; }
    .short-answer textarea { width: 100%; padding: 12px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 14px; font-family: inherit; resize: vertical; box-sizing: border-box; }
    .short-answer textarea:focus { outline: none; border-color: var(--primary); }

    .question-nav { display: flex; justify-content: space-between; gap: 12px; }
    .btn-nav { padding: 10px 24px; border: 1.5px solid var(--input-border); border-radius: 10px; background: var(--card-bg); cursor: pointer; font-size: 14px; font-weight: 600; }
    .btn-nav:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-nav:not(:disabled):hover { background: #f8fafc; }
    .btn-next { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; border-color: var(--primary); }
    .btn-next:hover { background: var(--primary-dark) !important; }
    .btn-submit { padding: 10px 24px; background: #2e7d32; color: #fff; border: none; border-radius: 10px; font-size: 14px; font-weight: 700; cursor: pointer; }
    .btn-submit:hover { background: #388e3c; }

    .question-palette { background: var(--card-bg); border-radius: var(--card-radius); padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); height: fit-content; position: sticky; top: 16px; }
    .question-palette h3 { margin: 0 0 12px; font-size: 14px; color: var(--primary); }
    .palette-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 16px; }
    .palette-btn { width: 36px; height: 36px; border: 2px solid #e0e0e0; border-radius: 10px; background: var(--card-bg); cursor: pointer; font-weight: 700; font-size: 13px; color: var(--text-secondary); transition: var(--transition); }
    .palette-btn.current { border-color: var(--primary); background: var(--primary-bg); color: var(--primary); }
    .palette-btn.answered { background: var(--success-bg); border-color: #66bb6a; color: var(--success-dark); }
    .palette-btn.answered.current { border-color: var(--primary); }
    .palette-legend { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; padding-top: 12px; border-top: 1px solid #f0f0f0; }
    .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--text-secondary); }
    .dot { width: 12px; height: 12px; border-radius: 4px; border: 2px solid #e0e0e0; }
    .dot.current { border-color: var(--primary); background: var(--primary-bg); }
    .dot.answered { border-color: #66bb6a; background: var(--success-bg); }
    .dot.unanswered { }
    .btn-submit-side { width: 100%; padding: 10px; background: #2e7d32; color: #fff; border: none; border-radius: 10px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .btn-submit-side:hover { background: #388e3c; }

    .already-submitted { text-align: center; max-width: 500px; margin: 40px auto; background: var(--card-bg); border-radius: 16px; padding: 40px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .submitted-icon { font-size: 48px; margin-bottom: 12px; }
    .already-submitted h2 { color: var(--primary); margin: 0 0 8px; }
    .already-submitted p { color: var(--text-secondary); margin: 0 0 24px; }
    .result-summary { display: flex; gap: 16px; justify-content: center; margin-bottom: 24px; }
    .result-card { background: #f8f9fe; border-radius: 10px; padding: 16px 24px; }
    .result-label { display: block; font-size: 11px; color: var(--text-muted); text-transform: uppercase; margin-bottom: 4px; }
    .result-value { font-size: 20px; font-weight: 700; color: var(--primary); }
    .nav-actions { display: flex; gap: 12px; justify-content: center; }
    .btn-primary { background: linear-gradient(135deg, var(--primary), var(--primary-dark)); color: #fff; padding: 10px 20px; border: none; border-radius: 10px; text-decoration: none; font-weight: 700; cursor: pointer; }
    .btn-secondary { background: var(--card-bg); color: var(--primary); padding: 10px 20px; border: 1px solid #1a237e; border-radius: 10px; text-decoration: none; font-weight: 700; }
    .no-data { text-align: center; color: var(--text-muted); font-style: italic; padding: 40px; }
  `]
})
export class ExamTakeComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private examService = inject(ExamService);
  readonly authService = inject(AuthService);

  exam = this.examService.getExamById(Number(this.route.snapshot.paramMap.get('id')));
  schedule = this.exam
    ? this.examService.getSchedulesByExamId(this.exam.id).find(s => s.id === Number(this.route.snapshot.paramMap.get('scheduleId')))
    : undefined;
  questions: ExamQuestion[] = this.schedule ? this.examService.getQuestionsByScheduleId(this.schedule.id) : [];

  started = signal(false);
  currentIndex = signal(0);
  answers = signal(new Map<number, string>());

  readonly currentQuestion = computed(() => this.questions[this.currentIndex()]);
  readonly answeredCount = computed(() => this.answers().size);
  readonly progressPercent = computed(() => (this.answeredCount() / this.questions.length) * 100);

  readonly existingSubmission = computed(() => {
    const user = this.authService.user();
    if (!user || !this.schedule) return undefined;
    return this.examService.getSubmissionByStudentAndSchedule(user.id, this.schedule.id);
  });

  readonly alreadySubmitted = computed(() => !!this.existingSubmission());

  setAnswer(questionId: number, value: string): void {
    this.answers.update(map => {
      const newMap = new Map(map);
      newMap.set(questionId, value);
      return newMap;
    });
  }

  nextQuestion(): void {
    if (this.currentIndex() < this.questions.length - 1) {
      this.currentIndex.update(i => i + 1);
    }
  }

  prevQuestion(): void {
    if (this.currentIndex() > 0) {
      this.currentIndex.update(i => i - 1);
    }
  }

  confirmSubmit(): void {
    const unanswered = this.questions.length - this.answeredCount();
    let message = 'Are you sure you want to submit the exam?';
    if (unanswered > 0) {
      message = `You have ${unanswered} unanswered question(s). Are you sure you want to submit?`;
    }
    if (confirm(message)) {
      this.submitExam();
    }
  }

  private submitExam(): void {
    const user = this.authService.user();
    if (!user || !this.exam || !this.schedule) return;

    const result = this.examService.gradeExam(this.questions, this.answers());
    this.examService.submitExam({
      examId: this.exam.id,
      scheduleId: this.schedule.id,
      studentId: user.id,
      studentName: user.name,
      answers: result.studentAnswers,
      totalMarks: result.totalMarks,
      obtainedMarks: result.obtainedMarks,
      submittedAt: new Date().toISOString().split('T')[0],
      status: 'graded',
    });

    this.router.navigate(['/exams', this.exam.id, 'schedule', this.schedule.id, 'result']);
  }
}
