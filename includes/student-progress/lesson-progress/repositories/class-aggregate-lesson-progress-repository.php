<?php
/**
 * File containing the class Aggregate_Lesson_Progress_Repository.
 *
 * @package sensei
 */

namespace Sensei\Student_Progress\Lesson_Progress\Repositories;

use Sensei\Student_Progress\Lesson_Progress\Models\Lesson_Progress;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class Aggregate_Lesson_Progress_Repository implements Lesson_Progress_Repository_Interface {
	/**
	 * Comments based lesson progress repository implementation.
	 *
	 * @var Comments_Based_Lesson_Progress_Repository
	 */
	private $comments_based_repository;

	/**
	 * Tables based lesson progress repository implementation.
	 *
	 * @var Tables_Based_Lesson_Progress_Repository
	 */
	private $tables_based_repository;

	/**
	 * The flag if the tables based implementation is available for use.
	 *
	 * @var bool
	 */
	private $use_tables;

	/**
	 * Aggregate_Lesson_Progress_Repository constructor.
	 *
	 * @param Comments_Based_Lesson_Progress_Repository $comments_based_repository Comments based lesson progress repository implementation.
	 * @param Tables_Based_Lesson_Progress_Repository   $tables_based_repository  Tables based lesson progress repository implementation.
	 * @param bool                                      $use_tables  The flag if the tables based implementation is available for use.
	 */
	public function __construct( Comments_Based_Lesson_Progress_Repository $comments_based_repository, Tables_Based_Lesson_Progress_Repository $tables_based_repository, bool $use_tables ) {
		$this->comments_based_repository = $comments_based_repository;
		$this->tables_based_repository   = $tables_based_repository;
		$this->use_tables                = $use_tables;
	}

	/**
	 * Creates a new lesson progress.
	 *
	 * @param int $lesson_id The lesson ID.
	 * @param int $user_id The user ID.
	 * @return Lesson_Progress The lesson progress.
	 */
	public function create( int $lesson_id, int $user_id ): Lesson_Progress {
		$progress = $this->comments_based_repository->create( $lesson_id, $user_id );
		if ( $this->use_tables ) {
			$this->tables_based_repository->create( $lesson_id, $user_id );
		}
		return $progress;
	}

	/**
	 * Gets a lesson progress.
	 *
	 * @param int $lesson_id The lesson ID.
	 * @param int $user_id The user ID.
	 * @return Lesson_Progress|null The lesson progress or null if it does not exist.
	 */
	public function get( int $lesson_id, int $user_id ): ?Lesson_Progress {
		return $this->comments_based_repository->get( $lesson_id, $user_id );
	}

	/**
	 * Checks if a lesson progress exists.
	 *
	 * @param int $lesson_id The lesson ID.
	 * @param int $user_id The user ID.
	 * @return bool Whether the lesson progress exists.
	 */
	public function has( int $lesson_id, int $user_id ): bool {
		return $this->comments_based_repository->has( $lesson_id, $user_id );
	}

	/**
	 * Save lesson progress.
	 *
	 * @param Lesson_Progress $lesson_progress The lesson progress.
	 */
	public function save( Lesson_Progress $lesson_progress ): void {
		$this->comments_based_repository->save( $lesson_progress );
		if ( $this->use_tables ) {
			$tables_based_progress = $this->tables_based_repository->get( $lesson_progress->get_lesson_id(), $lesson_progress->get_user_id() );
			if ( $tables_based_progress ) {

				$progress_to_save = new Lesson_Progress(
					$tables_based_progress->get_id(),
					$tables_based_progress->get_lesson_id(),
					$tables_based_progress->get_user_id(),
					$lesson_progress->get_status(),
					$lesson_progress->get_started_at(),
					$lesson_progress->get_completed_at(),
					$tables_based_progress->get_created_at(),
					$tables_based_progress->get_updated_at()
				);
				$this->tables_based_repository->save( $progress_to_save );
			}
		}
	}

	/**
	 * Returns the number of started lessons for a user in a course.
	 * The number of started lessons is the same as the number of lessons that have a progress record.
	 *
	 * @param int $course_id The course ID.
	 * @param int $user_id The user ID.
	 * @return int
	 */
	public function count( int $course_id, int $user_id ): int {
		return $this->comments_based_repository->count( $course_id, $user_id );
	}
}
