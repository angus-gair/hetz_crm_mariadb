<?php

namespace App\Extension\WebToMeeting\backend\Process\Service;

use ApiPlatform\Core\Exception\InvalidArgumentException;
use App\Process\Entity\Process;
use App\Process\Service\ProcessHandlerInterface;
use App\Module\Meeting\Entity\Meeting;
use App\Module\Users\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\Security\Core\Security;

class CreateMeetingFromWebForm implements ProcessHandlerInterface
{
    public const PROCESS_TYPE = 'create-meeting-from-webform';

    private $entityManager;
    private $security;
    private $logger;

    public function __construct(
        EntityManagerInterface $entityManager,
        Security $security,
        LoggerInterface $logger
    ) {
        $this->entityManager = $entityManager;
        $this->security = $security;
        $this->logger = $logger;
    }

    public function getProcessType(): string
    {
        return self::PROCESS_TYPE;
    }

    public function requiredAuthRole(): string
    {
        return 'ROLE_USER';
    }

    public function getRequiredACLs(Process $process): array
    {
        return [
            'Meetings' => [
                ['action' => 'edit']
            ]
        ];
    }

    public function configure(Process $process): void
    {
        $process->setAsync(false);
        $process->setId(self::PROCESS_TYPE);
    }

    public function validate(Process $process): void
    {
        $options = $process->getOptions();

        if (empty($options['formData'])) {
            throw new InvalidArgumentException('No form data provided');
        }

        $formData = $options['formData'];

        // Validate required fields
        if (empty($formData['name'])) {
            throw new InvalidArgumentException('Name is required');
        }
        if (empty($formData['email'])) {
            throw new InvalidArgumentException('Email is required');
        }
        if (empty($formData['preferredDatetime'])) {
            throw new InvalidArgumentException('Preferred date and time is required');
        }

        // Validate datetime format
        try {
            new \DateTime($formData['preferredDatetime']);
            if (isset($formData['endDatetime'])) {
                new \DateTime($formData['endDatetime']);
            }
        } catch (\Exception $e) {
            throw new InvalidArgumentException('Invalid datetime format');
        }
    }

    public function run(Process $process)
    {
        try {
            $this->logger->info('Starting meeting creation from web form');

            $options = $process->getOptions();
            $formData = $options['formData'];

            // Create new meeting
            $meeting = new Meeting();

            // Set basic meeting details
            $meeting->setName('Consultation with ' . $formData['name']);
            $meeting->setDescription(
                "Contact Details:\n" .
                "Name: {$formData['name']}\n" .
                "Email: {$formData['email']}\n" .
                "Phone: {$formData['phone']}\n\n" .
                "Notes:\n{$formData['notes']}"
            );

            // Set date/time
            $startDate = new \DateTime($formData['preferredDatetime']);
            $endDate = isset($formData['endDatetime']) 
                ? new \DateTime($formData['endDatetime'])
                : (clone $startDate)->modify('+1 hour');

            $meeting->setDateStart($startDate);
            $meeting->setDateEnd($endDate);

            // Set default status and type
            $meeting->setStatus('Planned');
            $meeting->setType('Web Consultation');

            // Get current user as creator
            /** @var User $currentUser */
            $currentUser = $this->security->getUser();
            $meeting->setAssignedUser($currentUser);
            $meeting->setCreatedBy($currentUser);

            // Save the meeting
            $this->entityManager->persist($meeting);
            $this->entityManager->flush();

            $this->logger->info('Successfully created meeting', [
                'id' => $meeting->getId(),
                'name' => $meeting->getName()
            ]);

            // Set success response
            $process->setStatus('success');
            $process->setMessages(['Meeting created successfully']);
            $process->setData([
                'meetingId' => $meeting->getId(),
                'name' => $meeting->getName(),
                'dateStart' => $meeting->getDateStart()->format('Y-m-d H:i:s')
            ]);

        } catch (\Exception $e) {
            $this->logger->error('Failed to create meeting', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            $process->setStatus('error');
            $process->setMessages(['Failed to create meeting: ' . $e->getMessage()]);
        }
    }
}