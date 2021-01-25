/**
 * Internal dependencies
 */
import registerSenseiBlocks from '../register-sensei-blocks';
import TakeCourseBlock from './take-course-block';
import CourseProgressBlock from './course-progress-block';
import { CourseBlock, LessonBlock, ModuleBlock } from './course-outline';

registerSenseiBlocks( [
	CourseBlock,
	ModuleBlock,
	LessonBlock,
	TakeCourseBlock,
	CourseProgressBlock,
] );
