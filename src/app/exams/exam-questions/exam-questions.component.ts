import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../shared/services/exam.service';
import { AuthService } from '../../shared/services/auth.service';
import { ExamQuestion } from '../../shared/models/exam.model';

@Component({
  selector: 'app-exam-questions',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="exam-questions">
      <a [routerLink]="['/exams', examId]" class="back-link">← Back to Exam Schedule</a>

      @if (exam && schedule) {
        <div class="page-header">
          <div>
            <h1>Manage Questions</h1>
            <p class="subtitle">{{ schedule.subject }} - {{ exam.name }} | Class {{ exam.class }}-{{ exam.section }}</p>
          </div>
          @if (!showAddForm()) {
            <button class="btn-primary" (click)="showAddForm.set(true)">+ Add Question</button>
          }
        </div>

        <div class="info-bar">
          <span>Total Questions: <strong>{{ questions().length }}</strong></span>
          <span>Total Marks: <strong>{{ totalMarks() }}</strong></span>
          <span>Max Marks: <strong>{{ schedule.maxMarks }}</strong></span>
        </div>

        @if (showAddForm()) {
          <div class="form-card">
            <h3>{{ editingId() ? 'Edit Question' : 'Add New Question' }}</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Question Text *</label>
                <textarea [(ngModel)]="formData.questionText" rows="3" placeholder="Enter the question..."></textarea>
              </div>
              <div class="form-group">
                <label>Type *</label>
                <select [(ngModel)]="formData.type">
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="short_answer">Short Answer</option>
                </select>
              </div>
              <div class="form-group">
                <label>Marks *</label>
                <input type="number" [(ngModel)]="formData.marks" min="1" />
              </div>
              @if (formData.type === 'mcq') {
                <div class="form-group">
                  <label>Option A *</label>
                  <input type="text" [(ngModel)]="optionA" placeholder="Option A" />
                </div>
                <div class="form-group">
                  <label>Option B *</label>
                  <input type="text" [(ngModel)]="optionB" placeholder="Option B" />
                </div>
                <div class="form-group">
                  <label>Option C *</label>
                  <input type="text" [(ngModel)]="optionC" placeholder="Option C" />
                </div>
                <div class="form-group">
                  <label>Option D *</label>
                  <input type="text" [(ngModel)]="optionD" placeholder="Option D" />
                </div>
              }
              <div class="form-group full-width">
                <label>Correct Answer *</label>
                @if (formData.type === 'mcq') {
                  <select [(ngModel)]="formData.correctAnswer">
                    <option value="">Select correct option</option>
                    @if (optionA) { <option [value]="optionA">A: {{ optionA }}</option> }
                    @if (optionB) { <option [value]="optionB">B: {{ optionB }}</option> }
                    @if (optionC) { <option [value]="optionC">C: {{ optionC }}</option> }
                    @if (optionD) { <option [value]="optionD">D: {{ optionD }}</option> }
                  </select>
                } @else {
                  <input type="text" [(ngModel)]="formData.correctAnswer" placeholder="Enter the correct answer" />
                }
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" (click)="cancelForm()">Cancel</button>
              <button class="btn-primary" (click)="saveQuestion()">{{ editingId() ? 'Update' : 'Add' }} Question</button>
            </div>
          </div>
        }

        <div class="questions-list">
          @for (q of questions(); track q.id; let i = $index) {
            <div class="question-item">
              <div class="q-header">
                <span class="q-num">Q{{ q.questionNumber }}</span>
                <span class="q-type" [class]="q.type">{{ q.type === 'mcq' ? 'MCQ' : 'Short Answer' }}</span>
                <span class="q-marks">{{ q.marks }} marks</span>
                <div class="q-actions">
                  <button class="btn-icon" (click)="editQuestion(q)" title="Edit">&#9998;</button>
                  <button class="btn-icon delete" (click)="deleteQuestion(q.id)" title="Delete">&#128465;</button>
                </div>
              </div>
              <p class="q-text">{{ q.questionText }}</p>
              @if (q.type === 'mcq' && q.options) {
                <div class="q-options">
                  @for (opt of q.options; track opt; let j = $index) {
                    <span class="q-opt" [class.correct]="opt === q.correctAnswer">
                      {{ ['A', 'B', 'C', 'D'][j] }}. {{ opt }}
                      @if (opt === q.correctAnswer) { <span class="correct-mark">&#10003;</span> }
                    </span>
                  }
                </div>
              } @else {
                <div class="q-answer">
                  <span class="answer-label">Answer:</span> <span class="answer-text">{{ q.correctAnswer }}</span>
                </div>
              }
            </div>
          } @empty {
            <p class="no-data">No questions added yet. Click "+ Add Question" to start.</p>
          }
        </div>
      } @else {
        <p class="no-data">Exam or schedule not found.</p>
      }
    </div>
  `,
  styles: [`
    .back-link { color: #1a237e; text-decoration: none; font-size: 14px; }
    .back-link:hover { text-decoration: underline; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin: 12px 0 16px; }
    .page-header h1 { margin: 0; color: #1a237e; }
    .subtitle { color: #666; margin: 4px 0 0; font-size: 14px; }
    .btn-primary { background: #1a237e; color: #fff; padding: 10px 20px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .btn-primary:hover { background: #283593; }
    .info-bar { display: flex; gap: 24px; background: #f8f9fe; border-radius: 10px; padding: 12px 20px; margin-bottom: 20px; font-size: 14px; color: #555; }
    .info-bar strong { color: #1a237e; }
    .form-card { background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); border-left: 4px solid #1a237e; margin-bottom: 20px; }
    .form-card h3 { margin: 0 0 16px; color: #1a237e; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .form-group { display: flex; flex-direction: column; gap: 4px; }
    .form-group.full-width { grid-column: 1 / -1; }
    label { font-size: 12px; font-weight: 600; color: #333; }
    input, select, textarea { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 14px; font-family: inherit; }
    input:focus, select:focus, textarea:focus { outline: none; border-color: #1a237e; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }
    .btn-cancel { padding: 8px 20px; border: 1px solid #ddd; border-radius: 6px; background: #fff; color: #666; cursor: pointer; }

    .questions-list { display: flex; flex-direction: column; gap: 12px; }
    .question-item { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
    .q-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .q-num { background: #1a237e; color: #fff; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .q-type { padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
    .q-type.mcq { background: #e3f2fd; color: #1565c0; }
    .q-type.short_answer { background: #f3e5f5; color: #7b1fa2; }
    .q-marks { background: #e8f5e9; color: #2e7d32; padding: 3px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
    .q-actions { margin-left: auto; display: flex; gap: 6px; }
    .btn-icon { background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px 6px; border-radius: 4px; }
    .btn-icon:hover { background: #f5f5f5; }
    .btn-icon.delete:hover { background: #ffebee; }
    .q-text { font-size: 15px; color: #333; margin: 0 0 10px; line-height: 1.5; }
    .q-options { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .q-opt { padding: 8px 12px; background: #f8f9fe; border-radius: 6px; font-size: 13px; color: #555; }
    .q-opt.correct { background: #e8f5e9; color: #2e7d32; font-weight: 500; }
    .correct-mark { color: #2e7d32; font-weight: 700; margin-left: 4px; }
    .q-answer { font-size: 13px; }
    .answer-label { color: #888; }
    .answer-text { color: #2e7d32; font-weight: 500; }
    .no-data { text-align: center; color: #999; font-style: italic; padding: 40px; }
  `]
})
export class ExamQuestionsComponent {
  private route = inject(ActivatedRoute);
  private examService = inject(ExamService);
  readonly authService = inject(AuthService);

  examId = Number(this.route.snapshot.paramMap.get('id'));
  scheduleId = Number(this.route.snapshot.paramMap.get('scheduleId'));

  exam = this.examService.getExamById(this.examId);
  schedule = this.exam
    ? this.examService.getSchedulesByExamId(this.exam.id).find(s => s.id === this.scheduleId)
    : undefined;

  questions = signal(this.schedule ? this.examService.getQuestionsByScheduleId(this.schedule.id) : []);
  showAddForm = signal(false);
  editingId = signal<number | null>(null);

  optionA = '';
  optionB = '';
  optionC = '';
  optionD = '';

  formData: { questionText: string; type: 'mcq' | 'short_answer'; marks: number; correctAnswer: string } = {
    questionText: '',
    type: 'mcq',
    marks: 5,
    correctAnswer: '',
  };

  totalMarks(): number {
    return this.questions().reduce((sum, q) => sum + q.marks, 0);
  }

  saveQuestion(): void {
    if (!this.formData.questionText || !this.formData.correctAnswer || !this.schedule) return;

    const options = this.formData.type === 'mcq' ? [this.optionA, this.optionB, this.optionC, this.optionD].filter(o => o) : undefined;

    if (this.editingId()) {
      this.examService.updateQuestion(this.editingId()!, {
        questionText: this.formData.questionText,
        type: this.formData.type,
        marks: this.formData.marks,
        correctAnswer: this.formData.correctAnswer,
        options,
      });
    } else {
      const nextNum = this.questions().length + 1;
      this.examService.addQuestion({
        scheduleId: this.schedule.id,
        questionNumber: nextNum,
        questionText: this.formData.questionText,
        type: this.formData.type,
        options,
        correctAnswer: this.formData.correctAnswer,
        marks: this.formData.marks,
      });
    }

    this.refreshQuestions();
    this.cancelForm();
  }

  editQuestion(q: ExamQuestion): void {
    this.editingId.set(q.id);
    this.formData = {
      questionText: q.questionText,
      type: q.type,
      marks: q.marks,
      correctAnswer: q.correctAnswer,
    };
    if (q.options) {
      this.optionA = q.options[0] ?? '';
      this.optionB = q.options[1] ?? '';
      this.optionC = q.options[2] ?? '';
      this.optionD = q.options[3] ?? '';
    }
    this.showAddForm.set(true);
  }

  deleteQuestion(id: number): void {
    if (confirm('Delete this question?')) {
      this.examService.deleteQuestion(id);
      this.refreshQuestions();
    }
  }

  cancelForm(): void {
    this.showAddForm.set(false);
    this.editingId.set(null);
    this.formData = { questionText: '', type: 'mcq', marks: 5, correctAnswer: '' };
    this.optionA = '';
    this.optionB = '';
    this.optionC = '';
    this.optionD = '';
  }

  private refreshQuestions(): void {
    if (this.schedule) {
      this.questions.set(this.examService.getQuestionsByScheduleId(this.schedule.id));
    }
  }
}
